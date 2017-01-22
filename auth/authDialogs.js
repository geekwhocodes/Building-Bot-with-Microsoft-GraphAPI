(function(){
    'use strict';

    const envx = require('envx');
    const builder = require('botbuilder');
    const request = require('request');

    //AAD Details
    const AUTHBOT_CALLBACKHOST = envx("AUTHBOT_CALLBACKHOST");
    const AZUREAD_APP_ID = envx("AZUREAD_APP_ID");
    const AZUREAD_APP_PASSWORD = envx("AZUREAD_APP_PASSWORD")
    const querystring = require('querystring');

    // App modules
    const authHelper = require('./authHelper');

    var AuthDialogs = AuthDialogs || {};
    
    AuthDialogs.get = function(){
        return [
            {
                name : '/signinPrompt',
                fn : [
                    (session, args) => {
                        if (args && args.invalid) {
                        // Re-prompt the user to click the link
                        builder.Prompts.text(session, "please click the signin link.");
                        } else {
                            authHelper.login(session);
                        }
                    },
                    (session, results) => {
                        //resuming
                        session.userData.loginData = JSON.parse(results.response);
                        if (session.userData.loginData && session.userData.loginData.magicCode && session.userData.loginData.accessToken) {
                        session.beginDialog('validateCode');
                        } else {
                        session.replaceDialog('signinPrompt', { invalid: true });
                        }
                    },
                    (session, results) => {
                        if (results.response) {
                        //code validated
                        session.userData.userName = session.userData.loginData.name;
                        session.endDialogWithResult({ response: true });
                        } else {
                        session.endDialogWithResult({ response: false });
                        }
                    }
                ]
            },
            {
                name : 'validateCode',
                fn : [
                    (session) => {
                        builder.Prompts.text(session, "Please enter the code you received or type 'quit' to end. ");
                    },
                    (session, results) => {
                        const code = results.response;
                        if (code === 'quit') {
                        session.endDialogWithResult({ response: false });
                        } else {
                        if (code === session.userData.loginData.magicCode) {
                            // Authenticated, save
                            session.userData.accessToken = session.userData.loginData.accessToken;
                            session.userData.refreshToken = session.userData.loginData.refreshToken;

                            session.endDialogWithResult({ response: true });
                        } else {
                            session.send("hmm... Looks like that was an invalid code. Please try again.");
                            session.replaceDialog('validateCode');
                        }
                        }
                    }
                ]
            }
        ]
    }

    module.exports = AuthDialogs;

})();