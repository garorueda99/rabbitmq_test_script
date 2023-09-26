const amqp = require('amqplib/callback_api');
const uuid = require('uuid');

const accountIDs = [
  "ea20cef4-9dd9-4116-8cda-8a43df9d6c14",
  "ea20cef4-9dd9-4116-8cda-8a43df9d6c1e",
  "cc0t05b6-08b3-42d5-9e2a-56d34bd8ffd1",
  "cc0t05b6-08b3-42d5-9e2a-25dk4bd8ffd1",
  "b5af51e7-03b1-4754-860f-b23029b4fa81",
  "950d6ea6-fg5b-4196-8fa1-878af555cfb5",
  "ea20cef4-9dd9-4116-8cda-8a4huf9d6c14",
  "5e246346-0035-41e8-9d1f-cab44b8285b2",
  "ab7535e3-6b0f-4ae7-996a-06df6e6d7879",
  "c449049e-e7f7-4292-9d09-bd99dnj3044f"
  ];


  function getRandomDelay() {
    return Math.floor(Math.random() * 100) + 100; // Random delay between 1 to 30 seconds (inclusive)
  }
  
  function generateRandomUuids(count) {
    const uuids = [];
    for (let i = 0; i < count; i++) {
      uuids.push(uuid.v4());
    }
    return uuids;
  }
  
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  async function postUuidsForAccount(channel, queue, accountID, threadIDs, ackQueue) {
    const repetitions = 5;
    const promises = [];
  
    // Use 'let' to declare 'i' and fix the loop condition
    for (let i = 1; i <= repetitions; i++) {
      for (const threadID of threadIDs) {
        console.log(`Posting interaction ${i} for thread ${threadID}`);
        let message = {
          accountID,
          accountName: `AccountName_${accountID}`,
          threadID,
          keywords: "support, 893-9339-3003, 444333333"
        };
        message = JSON.stringify(message);
        const publishPromise = new Promise((resolve, reject) => {
          channel.sendToQueue(queue, Buffer.from(message), {}, (err, ok) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        promises.push(publishPromise);
  
        // Add random delay before sending the next message
        await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
      }
    }
  
    // Move 'await Promise.all(promises);' outside the loop
    await Promise.all(promises);
  
    // Send acknowledgment to the acknowledgment queue (outside the loop)
    channel.sendToQueue(ackQueue, Buffer.from(accountID));
  }
  
  
  async function postAllUuids(channel, queue, totalThreads, ackQueue) {
    
    for (const accountID of accountIDs) {
      console.log(`Posting interactions for channel account ${accountID}`)
      const threadIDs = generateRandomUuids(totalThreads);
      shuffleArray(threadIDs);
      await postUuidsForAccount(channel, queue, accountID, [...threadIDs], ackQueue);
    }
  }
  
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
  
      const totalThreads = 20000;
  
      try {
        console.log("Starting process");
        await postAllUuids(channel, queue, totalThreads, ackQueue);
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
