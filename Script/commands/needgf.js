module.exports.config = {
  name: "needgf",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Maria (rX Modified)",
  description: "Send random gf link when someone says 'need gf'",
  commandCategory: "auto-response",
  usages: "",
  cooldowns: 0,
  triggerWords: ["need gf", "need a gf", "needgirlfriend"]
};

// ✅ তোমার দেওয়া শেয়ার লিংক
const allGirls = [
  "https://www.facebook.com/share/161rLzAe3f/?mibextid=wwXIfr",
  "https://www.facebook.com/share/19X1MoaaSb/?mibextid=wwXIfr",
  "https://www.facebook.com/share/171oDqWxeB/?mibextid=wwXIfr",
  "https://www.facebook.com/share/19fLTfAfRp/?mibextid=wwXIfr",
  "https://www.facebook.com/share/1Axho2Rt4x/?mibextid=wwXIfr",
  "https://www.facebook.com/share/15iug1Sgg9/?mibextid=wwXIfr",
  "https://www.facebook.com/share/1B5QJHqpqy/?mibextid=wwXIfr",
  "https://www.facebook.com/share/15wspPjdDU/?mibextid=wwXIfr"
];

let shuffled = [];
let index = 0;

// ✅ ফাংশন: নতুন করে শাফল করে
function reshuffle() {
  shuffled = [...allGirls].sort(() => Math.random() - 0.5);
  index = 0;
}

module.exports.handleEvent = async function({ api, event }) {
  const content = event.body?.toLowerCase();
  if (!content) return;

  const matched = module.exports.config.triggerWords.some(key => content.includes(key));
  if (!matched) return;

  // সব ID একবার দেখানোর পর আবার shuffle করো
  if (index >= shuffled.length) reshuffle();
  if (shuffled.length === 0) reshuffle();

  const girl = shuffled[index++];
  const reply = `এই নে তোর জিএফ 🥰\n${girl}\nযা ওর ইনবক্সে গিয়ে বিরক্ত কর 😎`;

  return api.sendMessage(reply, event.threadID, event.messageID);
};

module.exports.run = () => {};
