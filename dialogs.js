(function () {
    'use strict';

    var Dialogs = Dialogs || {}; // dialog module

    const builder = require('botbuilder');
    const https = require('https');
    const quesrystring = require('querystring');
    //const envx = require('envx'); / App Modules
    const graphAPI = require('./utilities/graphHelper');
    const UIHelper = require('./utilities/UIHelper');

    // const Intents = new builder.IntentDialog();
    // Intents.matches(/^profile/i,[getProfile]) .onDefault([]);

    Dialogs.get = function () {
        return [
            {
                name: '/',
                fn: [
                    (session, args, next) => {
                        if (!(session.userData.userName && session.userData.accessToken && session.userData.refreshToken)) {
                            session.beginDialog('/signinPrompt');
                        } else {
                            next();
                        }
                    },
                    (session, results, next) => {
                        if (session.userData.userName && session.userData.accessToken && session.userData.refreshToken) {
                            // yo logged in
                            builder
                                .Prompts
                                .text(session, "Welcome " + session.userData.userName + "! You are currently logged in. To quit, type 'quit'. To log out, type 'logout'.T" +
                                        "o view O365 Profile type profile.");
                        } else {
                            session.endConversation("Goodbye.");
                        }
                    },
                    (session, args, next) => {
                        var resp = args.response;
                        if (resp === 'profile') {
                            session.beginDialog('/getprofile');
                        } else if (resp === 'quit') {
                            session.endConversation("Goodbye.");
                        } else if (resp === 'logout') {
                            session.userData.loginData = null;
                            session.userData.userName = null;
                            session.userData.accessToken = null;
                            session.userData.refreshToken = null;
                            session.endConversation("You have logged out. Goodbye.");
                        } else {
                            next();
                        }
                    },
                    (session, results) => {
                        session.replaceDialog('/');
                    }
                ]
            },
            {
                name: '/getprofile',
                fn: [getProfile]
            }
        ]
    }

    function getProfile(session, args, next) {
        graphAPI.get('/beta/me', session.userData.accessToken, (profile) => {
            var message = new builder
                .Message(session)
                .attachments([UIHelper.buildProfileThumbnailCard(session, profile)]);
            session.send(message);
            session.endConversation();
        });
    }

    module.exports = Dialogs;

})();