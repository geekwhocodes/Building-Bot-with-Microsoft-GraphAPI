(function () {
    'use strict';

    const builder = require('botbuilder');

    var UIHelper = UIHelper || {
        buildProfileThumbnailCard: buildProfileThumbnailCard
    };

    function buildProfileThumbnailCard(session, profile) {
        var thumbnail = new builder.ThumbnailCard(session);
        thumbnail.title(profile.displayName);
        thumbnail.images([
            builder
                .CardImage
                .create(session, "http://lorempixel.com/g/450/450/")
        ]);

        if (true) 
            thumbnail.subtitle('XYZ Company | ' + profile.userPrincipalName);
        
        var text = '';
        if (profile.usageLocation) 
            text += profile.usageLocation + ' \n \r\n';
        if (true) 
            text += "Intern @rapidcircle | Microsoft Student Partner | Technology enthusiast | Quick " +
                    "Learner | Cool Geek :) | #MCP";
        
        thumbnail.text(text);
        thumbnail.tap(new builder.CardAction.openUrl(session, "https://twitter.com/geekwhocodes"));
        return thumbnail;
    }

    module.exports = UIHelper;

})();