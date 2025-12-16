import amqplib from "amqplib";

//this will retry to connect to rabbitmq if its not booted up yet.

const connectWithRetry = async () => {
  let retries = 0;
  while (true) {
    try {
      const connection = await amqplib.connect(process.env.RABBITMQ_URL);
      console.log("Connected to RabbitMQ");
      return connection;
    } catch (err) {
      retries++;
      console.log(`RabbitMQ not ready, retrying in 2s... (attempt ${retries})`);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
};

export default async function publishNotification({
  senderId,
  receiverId,
  entityId,
  type,
}) {
  const connection = await connectWithRetry();
  const channel = await connection.createChannel();
  const queue = "notification";

  await channel.assertQueue(queue, { durable: true });
  try {
    const message = {
      senderId, // Who performed the action (like/disliked)
      receiverId, // Who should get the notification
      entityId, // The object the action happened on (review, post, comment, etc.)
      type, // What kind of event it is ("review_created", "comment_liked", etc.)
    };
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    console.log("Sent message from likes service:", message);
  } catch (error) {
    console.log(error);
  } finally {
    if (channel) await channel.close().catch(console.error);
    if (connection) await connection.close().catch(console.error);
  }
}
