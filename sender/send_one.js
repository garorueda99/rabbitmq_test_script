const amqp = require('amqplib/callback_api');
const uuid = require('uuid');
  
  amqp.connect('amqp://10.16.1.13', (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel(async (error1, channel) => {
      if (error1) {
        throw error1;
      }
      const queue = 'social_router';
      const ackQueue = 'acknowledgment_queue';
  
      channel.assertQueue(queue, {
        durable: false
      });
  
      channel.assertQueue(ackQueue, {
        durable: false
      });
  
      try {
        console.log('Posting one interaction');
        let accountID = '11460c07-493d-48dc-bc01-9e25a20694a8';
        let message = {
          accountID,
          accountName: `AccountName_${accountID}`,
          threadID: uuid.v4(),
          interactionID: uuid.v4(),
          keywords: "support, 893-9339-3003, 444333333"
        };
        
        message = JSON.stringify(message);
        channel.sendToQueue(queue, Buffer.from(message), {}, (err, ok) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });

      } catch (error) {
        console.error("Error occurred during posting:", error);
      } finally {
        setTimeout(() => {
          connection.close();
          process.exit(0);
        }, 500);
      }
    });
  });
