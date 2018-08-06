'use strict';

const AWS = require('aws-sdk');

module.exports.get = (event, context, callback) => {

    // A very simple routine, everything is hardcoded since
    // none of these parameters are dynamic for the implementation
    var info = {};
    info['circular_supported'] = false;
    info['algorithms'] = ['md5', 'trunc512'];
    info['sequence_limit'] = 4000000;
    info['supported_api_versions'] = ['0.2']

    const response = {
	statusCode: 200,
	body: JSON.stringify({'service': info}),
        headers: { 'Content-Type': 'application/json' },
    };
    callback(null, response);

};
