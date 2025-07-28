module.exports.config = {
  name: "needgf",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Abdullah (rX Modified)",
  description: "Need GF keyword detector",
  commandCategory: "auto-response",
  usages: "",
  cooldowns: 0,
  triggerWords: ["need gf", "need a gf", "needgirlfriend"]
};

const girls = [
  "https://facebook.com/profile.php?id=100012345678901",
  "https://facebook.com/profile.php?id=100098765432109",
  "https://facebook.com/profile.php?id=100034567890123",
  "https://facebook.com/profile.php?id=100045612378900",
  "https://facebook.com/profile.php?id=100054321098765",
  "https://facebook.com/profile.php?id=100076543210987",
  "https://facebook.com/profile.php?id=100067890123456",
  "https://facebook.com/profile.php?id=100023456789001",
  "https://facebook.com/profile.php?id=100087654321099",
  "https://facebook.com/profile.php?id=100011223344556",
  "https://facebook.com/profile.php?id=100022233344455",
  "https://facebook.com/profile.php?id=100033344455566",
  "https://facebook.com/profile.php?id=100044455566677",
  "https://facebook.com/profile.php?id=100055566677788",
  "https://facebook.com/profile.php?id=100066677788899",
  "https://facebook.com/profile.php?id=100077788899900",
  "https://facebook.com/profile.php?id=100088899900011",
  "https://facebook.com/profile.php?id=100099900011122",
  "https://facebook.com/profile.php?id=100010011122233",
  "https://facebook.com/profile.php?id=100011122233344",
  "https://facebook.com/profile.php?id=100012233344455",
  "https://facebook.com/profile.php?id=100013344455566",
  "https://facebook.com/profile.php?id=100014455566677",
  "https://facebook.com/profile.php?id=100015566677788",
  "https://facebook.com/profile.php?id=100016677788899",
  "https://facebook.com/profile.php?id=100017788899900",
  "https://facebook.com/profile.php?id=100018899900011",
  "https://facebook.com/profile.php?id=100019900011122",
  "https://facebook.com/profile.php?id=100020011122233",
  "https://facebook.com/profile.php?id=100021122233344"
];

module.exports.handleEvent = async function({ api, event }) {
  const content = event.body?.toLowerCase();
  if (!content) return;

  const keywordMatch = module.exports.config.triggerWords.some(keyword => content.includes(keyword));
  if (!keywordMatch) return;

  const randomGirl = girls[Math.floor(Math.random() * girls.length)];

  const reply = `এই নে তোর জিএফ 🥰\n${randomGirl}\nযা ওর ইনবক্সে গিয়ে বিরক্ত কর 😎`;

  return api.sendMessage(reply, event.threadID, event.messageID);
};

module.exports.run = () => {};
