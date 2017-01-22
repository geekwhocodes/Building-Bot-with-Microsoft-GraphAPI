(function () {
    'use strict';

    const envx = require('envx');
    const builder = require('botbuilder');
    const request = require('request');
    const querystring = require('querystring');

    //oauth details
    const AZUREAD_APP_ID = envx("AZUREAD_APP_ID");
    const AZUREAD_APP_PASSWORD = envx("AZUREAD_APP_PASSWORD");
    const AZUREAD_APP_REALM = envx("AZUREAD_APP_REALM");
    const AUTHBOT_CALLBACKHOST = envx("AUTHBOT_CALLBACKHOST");
    const AUTHBOT_STRATEGY = envx("AUTHBOT_STRATEGY");

    var AuthHelper = AuthHelper || {
        getOIDStrategy: getOIDStrategy,
        login: login,
        getAccessTokenWithRefreshToken: getAccessTokenWithRefreshToken
    };

    function getOIDStrategy() {
        var realm = AZUREAD_APP_REALM;
        let oidStrategyv1 = {
            redirectUrl: AUTHBOT_CALLBACKHOST + '/api/OAuthCallback',
            realm: realm,
            clientID: AZUREAD_APP_ID,
            clientSecret: AZUREAD_APP_PASSWORD,
            validateIssuer: false,
            allowHttpForRedirectUrl: true,
            oidcIssuer: undefined,
            identityMetadata: 'https://login.microsoftonline.com/' + realm + '/.well-known/openid-configuration',
            skipUserProfile: true,
            responseType: 'code',
            responseMode: 'query',
            passReqToCallback: true
        };
        return oidStrategyv1;
    }

    function login(session) {
        // Generate signin link
        const address = session.message.address;
        // TODO: Encrypt the address string
        const link = AUTHBOT_CALLBACKHOST + '/login?address=' + querystring.escape(JSON.stringify(address));

        var msg = new builder
            .Message(session)
            .attachments([
                new builder
                    .SigninCard(session)
                    .text("Please click this link to sign in.")
                    .button("SignIn", link)
            ]);
        session.send(msg);
        builder
            .Prompts
            .text(session, "You must first sign into your account.");
    }

    function getAccessTokenWithRefreshToken(refreshToken, callback) {
        var data = 'grant_type=refresh_token&refresh_token=' + refreshToken + '&client_id=' + AZUREAD_APP_ID + '&client_secret=' + encodeURIComponent(AZUREAD_APP_PASSWORD)

        var options = {
            method: 'POST',
            url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            body: data,
            json: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        request(options, function (err, res, body) {
            if (err) 
                return callback(err, body, res);
            if (parseInt(res.statusCode / 100, 10) !== 2) {
                if (body.error) {
                    return callback(new Error(res.statusCode + ': ' + (body.error.message || body.error)), body, res);
                }
                if (!body.access_token) {
                    return callback(new Error(res.statusCode + ': refreshToken error'), body, res);
                }
                return callback(null, body, res);
            }
            callback(null, {
                accessToken: body.access_token,
                refreshToken: body.refresh_token
            }, res);
        });
    }

    module.exports = AuthHelper;

})();