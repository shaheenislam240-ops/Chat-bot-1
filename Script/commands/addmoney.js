module.exports.config = {
  name: "addmoney",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "rX abdullah",
  description: "Add money to user (bot admin only)",
  commandCategory: "admin",
  usages: "addmoney @user <amount>",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID, mentions } = event;

  if (!global.config.ADMINBOT || !global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage("🚫 You must be bot admin to use this command.", threadID, messageID);
  }

  if (!mentions || Object.keys(mentions).length === 0) {
    return api.sendMessage("🚫 Please tag a user to add money.", threadID, messageID);
  }

  if (args.length < 2) {
    return api.sendMessage("Usage: addmoney @user <amount>", threadID, messageID);
  }

  const userId = Object.keys(mentions)[0];
  const amount = parseInt(args[args.length - 1]);

  if (isNaN(amount) || amount <= 0) {
    return api.sendMessage("🚫 Amount must be a positive number.", threadID, messageID);
  }

  await Currencies.increaseMoney(userId, amount);
  const userName = await Users.getName(userId);

  return api.sendMessage(`✅ Added $${amount} to ${userName}`, threadID, messageID);
};
