module.exports.config = {
  name: "truthordare",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "rX Abdullah + ChatGPT",
  description: "Play truth or dare with reply judgment",
  commandCategory: "fun",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;
  const name = await Users.getNameUser(senderID);

  const countdown = [
    { text: "⏳ 3...", delay: 1000 },
    { text: "⏳ 2...", delay: 2000 },
    { text: "⏳ 1...", delay: 3000 },
    { text: "🎉 Ready!", delay: 4000 }
  ];

  for (const step of countdown) {
    setTimeout(() => {
      api.sendMessage(step.text, threadID);
    }, step.delay);
  }

  setTimeout(() => {
    const type = Math.random() < 0.5 ? "truth" : "dare";

    const truths = [
      "❓ Have you ever lied to get out of trouble? | তুমি কি কোনো ঝামেলা থেকে বের হতে মিথ্যা বলেছো?",
      "❓ Do you have a secret crush? | তোমার কি গোপন ক্রাশ আছে?",
      "❓ Have you ever cheated in an exam? | তুমি কি কখনো পরীক্ষায় নকল করেছো?",
      "❓ Have you ever stolen something? | তুমি কি কখনো কিছু চুরি করেছো?",
      "❓ Who was your first love? | তোমার প্রথম ভালোবাসা কে ছিল?"
    ];

    const dares = [
      "🔥 Call someone right now and say 'I love you' | এখনই কাউকে কল করে বলো 'আই লাভ ইউ'!",
      "🔥 Send a funny selfie in the group | গ্রুপে মজার সেলফি পাঠাও!",
      "🔥 Sing your favorite song and send a voice message | তোমার প্রিয় গানটি গেয়ে ভয়েস মেসেজ পাঠাও!",
      "🔥 Type 'I am the cutest here' in the group | গ্রুপে লিখো 'আমি এখানে সবচেয়ে কিউট!'",
      "🔥 Share the last photo you took | তোমার তোলা শেষ ছবি শেয়ার করো!"
    ];

    const question = type === "truth"
      ? truths[Math.floor(Math.random() * truths.length)]
      : dares[Math.floor(Math.random() * dares.length)];

    const msg = `${type === "truth" ? "🟢 𝗧𝗥𝗨𝗧𝗛 𝗧𝗜𝗠𝗘" : "🔴 𝗗𝗔𝗥𝗘 𝗧𝗜𝗠𝗘"}\n` +
      `➤ ${name}, ${type === "truth" ? "answer this" : "do this dare"}:\n` +
      `${question}\n\n💬 Reply to this message with your ${type === "truth" ? "answer" : "proof"}.`;

    api.sendMessage(msg, threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        authorName: name
      });
    }, messageID);
  }, 5000);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (senderID !== handleReply.author) {
    return api.sendMessage("🚫 Only the player who got the question can answer!", threadID, messageID);
  }

  const answer = body.toLowerCase();
  let quoteEN = "", quoteBN = "", type = "";

  const positiveWords = ["yes", "i did", "sure", "of course", "হ্যাঁ", "হ্যা", "done", "complete", "ok"];
  const negativeWords = ["no", "never", "nai", "না", "can't", "cannot", "nope"];

  if (positiveWords.some(word => answer.includes(word))) {
    type = "good";
    const quotes = [
      { en: "Honesty is the best policy.", bn: "সততা শ্রেষ্ঠ গুণ।" },
      { en: "You’re brave to face the truth.", bn: "তুমি সত্যের মুখোমুখি হতে সাহসী।" },
      { en: "Nice! You did it.", bn: "দারুন! তুমি করে দেখিয়েছো।" }
    ];
    const picked = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEN = picked.en;
    quoteBN = picked.bn;
  } else if (negativeWords.some(word => answer.includes(word))) {
    type = "bad";
    const quotes = [
      { en: "The truth can hurt, but it heals.", bn: "সত্য কষ্ট দিতে পারে, কিন্তু এটি নিরাময় করে।" },
      { en: "Next time, try to open up!", bn: "পরের বার একটু খোলামেলা হওয়ার চেষ্টা করো!" },
      { en: "It’s okay. We all hesitate sometimes.", bn: "ঠিক আছে। মাঝে মাঝে সবাই দ্বিধায় পড়ে।" }
    ];
    const picked = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEN = picked.en;
    quoteBN = picked.bn;
  } else {
    type = "neutral";
    quoteEN = "Interesting answer!";
    quoteBN = "মজার উত্তর!";
  }

  const title = type === "good"
    ? "✅ 𝐆𝐎𝐎𝐃 𝐀𝐍𝐒𝐖𝐄𝐑"
    : type === "bad"
    ? "❌ 𝐁𝐀𝐃 𝐀𝐍𝐒𝐖𝐄𝐑"
    : "ℹ️ 𝐀𝐍𝐒𝐖𝐄𝐑 𝐑𝐄𝐂𝐄𝐈𝐕𝐄𝐃";

  const msg = `${title}\n` +
    `➤ ${handleReply.authorName}\n` +
    `💬 "${quoteEN}"\n` +
    `💬 "${quoteBN}"`;

  return api.sendMessage(msg, threadID, messageID);
};
