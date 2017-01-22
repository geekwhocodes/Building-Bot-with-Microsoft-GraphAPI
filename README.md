# nodebot-consuming-MSgraphAPI
This sample build using Microsoft Bot Builder framework to demonstrate how to consume Microsoft Graph API's in bot all using NODE.JS

#Setup

Prerequisites

    A LUIS model trained
    A Slack account you can add a bot to
    
    #Install components

    npm install
    
    Create environmental values

    Add a new file named .env.
    Add the following values:

        MICROSOFT_APP_ID= <Microsoft AP Id follow steps to create bot https://dev.botframework.com/bots/new>
        MICROSOFT_APP_PASSWORD= <get it from above atep>
        AZUREAD_APP_ID=<your azure ad app clientID frollow instructions here https://docs.microsoft.com/en-us/azure/active-directory/active-directory-app-registration>
        AZUREAD_APP_PASSWORD=<get it from Azure portal after compeleting above step>
        AZUREAD_APP_REALM= <leave it 'common' or your tenant name or ID>
        AUTHBOT_CALLBACKHOST= <PUT here your bot server url ex. https://mybot.com>
        AUTHBOT_STRATEGY=oidStrategyv1 //leave it as is, read more here https://github.com/AzureAD/passport-azure-ad
        AAD_RESOURCE_URI=https://graph.microsoft.com /// leave it as is, as we are accessing resources from this endpoint

    Exapmle : 
        MICROSOFT_APP_ID=XXXDXXX-XXX4-XXXX-XXXc-cadb3d3435e6
        MICROSOFT_APP_PASSWORD=LVCTOTTctiV0WZWnm8XdFGVj
        AZUREAD_APP_ID=XXXDXXX-XXX4-XXXX-XXXc-cadb3d3435e6
        AZUREAD_APP_PASSWORD=Ur44WfdghgKqibWNJsrgdf6ZjipISjPoFuKj5A=
        AZUREAD_APP_REALM=common
        AUTHBOT_CALLBACKHOST=http://localhost:3880
        AUTHBOT_STRATEGY=oidStrategyv1
        AAD_RESOURCE_URI=https://graph.microsoft.com