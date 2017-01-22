(function () {
    'use strict';

    var graphAPI = graphAPI || {};

    const https = require('https');
    const querystring = require('querystring');

    const _host = 'graph.microsoft.com';
    const userAgent = 'O365 Planner Bot';

    graphAPI.get = function (query, accessToken, callback) {
        var options = {
            host: _host,
            path: query,
            method: 'GET',
            headers: {
                'User-Agent': userAgent,
                Authorization: 'Bearer ' + accessToken
            }
        };
        graphAPI.executeRequest(options, callback);
    }

    graphAPI.executeRequest = function (options, callback) {
        var request = https.request(options, function (response) {
            var data = '';
            response.on('data', function (chunk) {
                data += chunk;
            });
            response.on('end', function () {
                // Check token error try to refresh token using
                // ./authHelper.getAccessTokenWithRefreshToken(refreshtOKEN, callback) and
                // request again => finally send error or re-login prompt
                callback(JSON.parse(data));
            });
        });
        request.end();
    }

    module.exports = graphAPI;

})();