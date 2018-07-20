var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {
    debug('Configured /botkit/receive url');
    webserver.post('/botkit/receive', function(req, res) {
        // respond to Slack that the webhook has been received.
        res.status(200);

        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res);
    });

    controller.hears('hello', 'message_received', function(bot, message) {
        bot.createConversation(message, function(err, convo) {
            convo.setVar('foo', 'bar');
            convo.setVar('list', [
                { value: 'option 1' },
                { value: 'option 2' }
            ]);
            convo.setVar('object', { name: 'Chester', type: 'imaginary' });

            // create a path for when a user says YES
            convo.addMessage(
                {
                    text: 'You said yes! How wonderful. {{vars.foo}}'
                },
                'yes_thread'
            );

            // create a path for when a user says NO
            convo.addMessage(
                {
                    text: 'You said no, that is too bad.'
                },
                'no_thread'
            );

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage(
                {
                    text: 'Sorry I did not understand.',
                    action: 'default'
                },
                'bad_response'
            );

            // Create a yes/no question in the default thread...
            convo.addQuestion(
                'Do you like cheese?',
                [
                    {
                        pattern: bot.utterances.yes,
                        callback: function(response, convo) {
                            convo.gotoThread('yes_thread');
                        }
                    },
                    {
                        pattern: bot.utterances.no,
                        callback: function(response, convo) {
                            convo.gotoThread('no_thread');
                        }
                    },
                    {
                        default: true,
                        callback: function(response, convo) {
                            convo.gotoThread('bad_response');
                        }
                    }
                ],
                {},
                'default'
            );

            convo.activate();
        });
    });
};
