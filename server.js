(function(){
    'user strict';
    
    const dotenv = require('dotenv');
    dotenv.load();

    var Connector = require('./connector');
    
    var botConfig = {
        name : 'My Awesome Bot',
        version : '0.1.0',
        author : {
            name : 'Ganesh Raskar',
            github : 'https://github.com/geekwhocodes',
            website : 'http://geekwhocodes.me',
            twitter : '@geekwhocodes',
            email : 'ganeshraskar@outlook.com'
        },
        serverInfo : {
            serverName : 'My Awesome Bot Server',
            port : 3880,
            loggerConfig : {
                name : 'My Awesome Bot Logger',
                errorLevel : 'error',
                errorName : 'error'
            },
            throttleConfig:{
                burst: 50,
                rate: 10,
                ip: true,
            }
        },
        connectorType : 'chat' // either console or chat /// This sample isn't tested with console connector
    }

    Connector.startBot(botConfig); //  Fire up bot;

})();