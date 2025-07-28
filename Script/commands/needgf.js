const axios = require("axios");

module.exports.config = {
  name: "needgf",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Maria (rX Modified)",
  description: "Send random gf link with photo & Bangla title",
  commandCategory: "auto-response",
  usages: "",
  cooldowns: 0,
  triggerWords: ["need gf", "need a gf", "needgirlfriend"]
};

// ✅ তোমার লিংক + টাইটেল আলাদা
const girlsData = [
  {
    link: "https://www.facebook.com/share/161rLzAe3f/?mibextid=wwXIfr",
    title: "মেয়েটার দিকে তাকাইলেই গুলি মারবো 😠"
  },
  {
    link: "https://www.facebook.com/share/19X1MoaaSb/?mibextid=wwXIfr",
    title: "এইটা অনেক কিউট, হ্যান্ডেল করতে পারবি তো? 😏"
  },
  {
    link: "https://www.facebook.com/share/171oDqWxeB/?mibextid=wwXIfr",
    title: "প্রেম করবি নাকি গাছে উঠবি? 🌳❤️"
  },
  {
    link: "https://www.facebook.com/share/19fLTfAfRp/?mibextid=wwXIfr",
    title: "এই মেয়ের জন্য অনেকে ঝাঁপাই দিছে... সাবধানে 😬"
  },
  {
    link: "https://www.facebook.com/share/1Axho2Rt4x/?mibextid=wwXIfr",
    title: "গার্লফ্রেন্ড হইলে প্রতি মাসে ১০০০ টাকা দিতে হবে 😎"
  },
  {
    link: "https://www.facebook.com/share/15iug1Sgg9/?mibextid=wwXIfr",
    title: "মায়ের পছন্দ করা মেয়ে — বুঝে শুনে নিস 🤭"
  },
  {
    link: "https://www.facebook.com/share/1B5QJHqpqy/?mibextid=wwXIfr",
    title: "এইটা নাকি crush... confirm করে দে 🤔"
  },
  {
    link: "https://www.facebook.com/share/15wspPjdDU/?mibextid=wwXIfr",
    title: "তুই যদি না চাস, আমি চাই 😍"
  },
  {
    link: "https://www.facebook.com/share/14DMHqyoUCW/?mibextid=wwXIfr",
    title: "তুই বললি need gf, আমি পাঠায় দিলাম বাজে কিছু 😅"
  }
];

let usedIndexes = [];

function getNextRandom() {
  if (usedIndexes.length === girlsData.length) usedIndexes = [];
  let idx;
  do {
    idx = Math.floor(Math.random() * girlsData.length);
  } while (usedIndexes.includes(idx));
  usedIndexes.push(idx);
  return girlsData[idx];
}

module.exports.handleEvent = async function({ api, event }) {
  const msg = event.body?.toLowerCase();
  if (!msg || !module.exports.config.triggerWords.some(k => msg.includes(k))) return;

  const { link, title } = getNextRandom();

  try {
    // 🔍 প্রোফাইল পিকচার বের করার চেষ্টা
    const profilePicURL = await getFacebookImage(link);
    const img = (await axios.get(profilePicURL, { responseType: 'stream' })).data;

    return api.sendMessage({
      body: `${title}\n${link}\nযা ওর ইনবক্সে গিয়ে বিরক্ত কর 😎`,
      attachment: img
    }, event.threadID, event.messageID);

  } catch (err) {
    console.error("❌ Image fetch error:", err.message);
    // fallback if image fails
    return api.sendMessage(`${title}\n${link}\nযা ওর ইনবক্সে গিয়ে বিরক্ত কর 😎`, event.threadID, event.messageID);
  }
};

async function getFacebookImage(shareLink) {
  try {
    const { data } = await axios.get(shareLink);
    const match = data.match(/"og:image"\s*content="([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

module.exports.run = () => {};
