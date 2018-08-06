'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

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
      },
    };

    // fetch todo from the database
    let result = await dynamoDb.get(params).promise()

    // If we didn't get a hit for the hash, 404 not found
    if(isEmpty(result)) {
      throw new errors.Http404();
    }

    let metadata = {};
    metadata['id'] = event.pathParameters.checksum;
    metadata['length'] = result.Item.seq_length;
    metadata['aliases'] = result.Item.aliases;
    metadata[result.Item.checksum_type] = result.Item.checksum;
    metadata = {...metadata, ...result.Item.checksums};

    const response = {
	statusCode: 200,
	body: JSON.stringify({'metadata': metadata}),
        headers: { 'Content-Type': 'application/vnd.ga4gh.seq.v1.0.0+json' },
    };
    callback(null, response);

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
};
