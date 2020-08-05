var amqp = require('amqplib/callback_api');

module.exports = (url) => {
    return new Promise((resolve, reject) => {
        amqp.connect('amqp://localhost', function(error0, connection) {
            if (error0) {
                reject(error0)
                return
            } else {
                resolve(connection)
            }
        });
    })
}