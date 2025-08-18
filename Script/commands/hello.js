module.exports.config = {
  name: "hello",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "rX",
  description: "Mention someone multiple times in separate messages",
  commandCategory: "fun",
  usages: "/hello @tag amount",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  if (!event.mentions || Object.keys(event.mentions).length === 0)
    return api.sendMessage("❌ কাউকে মেনশন করতে হবে। উদাহরণ: /mention @name 10", event.threadID, event.messageID);

  const mentionID = Object.keys(event.mentions)[0];
  const name = event.mentions[mentionID];
  const amount = parseInt(args[args.length - 1]);

  if (isNaN(amount) || amount < 1 || amount > 150)
    return api.sendMessage("❌ সংখ্যা দিতে হবে ১ থেকে ১৫০ এর মধ্যে।", event.threadID, event.messageID);

  for (let i = 0; i < amount; i++) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Optional delay to avoid spam detection
    api.sendMessage({
      body: `${name}`,
      mentions: [{ tag: name, id: mentionID }]
    }, event.threadID);
  }
};
