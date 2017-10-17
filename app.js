
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
process.env.MICROSOFT_APP_ID = 'dc367a86-cc14-40a2-ae58-45d115c4b919';
process.env.MICROSOFT_APP_PASSWORD = 'bTdKmdfONGgAEEhYVuOu2g6';

const QNA_URI = 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/a770aeff-5788-4b8f-94ae-effaa0233691/generateAnswer';
const headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': '1b819d1df78d4e8eaac9628b7a46309e'
};

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by using QnA maker
var bot = new builder.UniversalBot(connector, function (session) {
    qna(session.message.text, (error, result) => {
        if (error) {
            session.send("Error: %s", error);
        }
        else {
            console.log(result);
            var msg = result.answers[0].answer;
            session.send(msg);
        }
    });

});

function qna(query, cb) {
    var jsonBody = {
        'question': query
    };
    console.log('[query] ' + jsonBody.question);
    request({
        url: QNA_URI,
        method: 'POST',
        json: true,
        headers: headers,
        body: jsonBody},
        (error, response, body) => {
            if (error) {
                cb(error, null);
            }
            else if (response.statusCode !== 200) {
                // Valid response from QnA but it's an error
                // return the response for further processing
                cb(response, null);
            }
            else {
                // All looks OK, the answer is in the body
                cb(null, body);
            }
        }
    );
}

