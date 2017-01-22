(function () {
    'use strict';

    const envx = require('envx');
    const builder = require('botbuilder');
    const restify = require('restify');
    const bunyanLogger = require('bunyan');
    const passport = require('passport');
    const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
    const crypto = require('crypto');
    const expressSession = require('express-session');
    const querystring = require('querystring');

    /// App modules
    const dialogs = require('./dialogs');
    const authHelper = require('./auth/authHelper');
    const authDialogs = require('./auth/authDialogs');
    /// App moduls End AAD const
    const AAD_RESOURCE_URI = envx("AAD_RESOURCE_URI");

    var Connector = Connector || {}; // Connector module

    Connector.startBot = function (config) {
        var connector = createBotConnector(config.connectorType);
        var bot = new builder.UniversalBot(connector, {
            persistConversationData: true,
            persistUserData: true
        });

        if (config.connectorType === 'chat') {
            var server = startServer(config.serverInfo);

            server.post('api/messages', connector.listen()); // all user requests

            server.get('/login', function (req, res, next) {
                passport
                    .authenticate('azuread-openidconnect', {
                        failureRedirect: '/login',
                        customState: req.query.address,
                        resourceURL: AAD_RESOURCE_URI
                    }, function (err, user, info) {
                        //console.log('login');
                        if (err) {
                            //console.log(err);
                            return next(err);
                        }
                        if (!user) {
                            return res.redirect('/login');
                        }
                        req
                            .logIn(user, function (err) {
                                if (err) {
                                    return next(err);
                                } else {
                                    return res.send('Welcome ' + req.user.displayName);
                                }
                            });
                    })(req, res, next);
            });
            server.get('/api/OAuthCallback/', passport.authenticate('azuread-openidconnect', {failureRedirect: '/login'}), (req, res) => {
                // console.log('OAuthCallback'); console.log(req);
                const address = JSON.parse(req.query.state);
                const magicCode = crypto
                    .randomBytes(4)
                    .toString('hex');
                const messageData = {
                    magicCode: magicCode,
                    accessToken: req.user.accessToken,
                    refreshToken: req.user.refreshToken,
                    userId: address.user.id,
                    name: req.user.displayName,
                    email: req.user.preferred_username
                };

                var continueMsg = new builder
                    .Message()
                    .address(address)
                    .text(JSON.stringify(messageData));
                console.log(continueMsg.toMessage());

                bot.receive(continueMsg.toMessage());
                res.send('Welcome ' + req.user.displayName + '! Please copy this number and paste it back to your chat so your authentication ' +
                        'can complete: ' + magicCode);
            });

            passport.serializeUser(function (user, done) {
                done(null, user);
            });

            passport.deserializeUser(function (id, done) {
                done(null, id);
            });

            passport.use(new OIDCStrategy(authHelper.getOIDStrategy(), (req, iss, sub, profile, accessToken, refreshToken, done) => {
                if (!profile.displayName) {
                    return done(new Error("No oid found"), null);
                }
                // asynchronous verification
                process.nextTick(() => {
                    profile.accessToken = accessToken;
                    profile.refreshToken = refreshToken;
                    return done(null, profile);
                });
            }));

        }

        // bot.dialog('/', intents); // handle intents dialogs bot.dialog('/loop',
        // (session, ergs, next) =>{ });
        var _authDialogs = authDialogs.get();
        _authDialogs.forEach(function (dialog) {
            bot.dialog(dialog.name, dialog.fn);
        });
        var _appDialogs = dialogs.get();
        _appDialogs.forEach(function (dialog) {
            bot.dialog(dialog.name, dialog.fn);
        });

    }

    function createBotConnector(type) {
        try {
            if (!typeof(type) === 'string' || type !== 'chat' && type !== 'console') {
                console.error('Invalid Connector');
                throw new Error('Invalid Connector');
                return false;
            } else {
                var connector;
                if (type === 'console') {
                    connector = new builder
                        .ConsoleConnector()
                        .listen();
                }
                if (type === 'chat') {
                    connector = new builder.ChatConnector({appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});
                }
                return connector;
            }
        } catch (err) {
            throw new Error('Opps!, we got a problem while createting chat connector :', err);
        }
    }

    function startServer(config) {
        var bunyanLogger = createLogger(config.loggerConfig);
        var server = restify.createServer({name: config.serverName, log: bunyanLogger});
        server.listen(process.env.port || process.env.PORT || config.port, function () {
            console.info('Server %s listening on %s : %s', server.name, server.url, config.port);
        });
        server.use(restify.queryParser());
        server.use(restify.bodyParser());
        server.use(expressSession({secret: 'bluemokeyazoread', resave: true, saveUninitialized: false}));
        server.use(passport.initialize());
        server.use(restify.throttle(config.throttleConfig));

        return server;
    }

    function createLogger(config) {
        var log = bunyanLogger.createLogger({
            name: config.name,
            streams: [
                {
                    stream: process.stderr,
                    level: config.errorLevel,
                    name: config.errorName
                },
                // {     stream: process.stdout,     level: "warn",     name: "console" },
            ]
        });
        return log
    }

    module.exports = Connector;

})();