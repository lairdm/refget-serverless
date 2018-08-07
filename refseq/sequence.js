'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3({region: 'us-west-2'});

// Custom error classes
const errors = require('./errors');

// Our isEmpty function
const isempty = require('./is_object_empty');
const isEmpty = isempty.isEmpty;

module.exports.get = async (event, context, callback) => {
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        checksum: event.pathParameters.checksum,
//      checksum: "b7ebc601f9a7df2e1ec5863deeae88a3",
//        checksum: "bad",
      },
    };

    // fetch todo from the database
    let result = await dynamoDb.get(params).promise()

    // If we didn't get a hit for the hash, 404 not found
    if(isEmpty(result)) {
      throw new errors.Http404();
    }

    // Handle if we have start/end
    if("queryStringParameters" in event &&
       event.queryStringParameters &&
      ("start" in event.queryStringParameters ||
       "end" in event.queryStringParameters)) {
      if("headers" in event && "Range" in event.headers) {
  	// Error, we can't have Range and query string params
	throw new errors.Http400();
      }

      let start = ("start" in event.queryStringParameters) ? event.queryStringParameters.start : 0;
      let end = ("end" in event.queryStringParameters) ? event.queryStringParameters.end - 1 : result.Item.seq_length;

      if(start < 0 ||
         end > result.Item.seq_length) {

        // Error, out of range
        throw new errors.Http414();
      }

      // We don't support circular chromosomes
      if(start > end) {
        throw new errors.Http501();
      }

      // We can only return a max of 4MB, error if they're
      // requesting a bigger slice
      if((end - start) > 4000000) {
        throw new errors.Http406();
      }

      // Query the S3 bucket to fetch the sub-sequence
      let params = { Bucket: result.Item.bucket,
  		     Key: result.Item.filename,
		     Range: `bytes=${start}-${end}`};

      await s3.getObject(params, function(err, data) {
	if(err) {
	  throw new errors.HttpError();
	}

        // We received the sequence, return it to the user directly
        callback(null, {
          statusCode: 200,
          body: data.Body.toString('ascii'),
          headers: { 'Content-Type': 'text/vnd.ga4gh.refget.v1.0.0+plain; charset=us-ascii' },
	});
	return;
      }).promise();

    } else { // end start/end block, we're doing a whole sequence or Range

      callback(null, {
  	statusCode: 301,
	headers: {
	  Location: 'https://s3-' + process.env.CURRENT_REGION + '.amazonaws.com/' + result.Item.bucket + '/' + result.Item.filename,
	},
      });
      return;
	
    }
  } catch(error) {
    if(error.hasOwnProperty('status')) {
      // One of our custom http errors
      callback(null, {
        statusCode: error.status,
	body: error.message,
	headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      // Generic server error
      callback(null, {
        statusCode: 500,
        body: 'Unknown server error',
        headers: { 'Content-Type': 'text/plain' },
      });

	// Add logging here with error.message
    }
  }

  return;
 
};
