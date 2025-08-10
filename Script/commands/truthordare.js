module.exports.config = {
  name: "truthordare",
  version: "1.3.0",
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
      "❓ Who was your first love? | তোমার প্রথম ভালোবাসা কে ছিল?",
      "❓ What's the most embarrassing thing you've done? | তোমার সবচেয়ে বিব্রতকর কাজ কী?",
      "❓ Have you ever pretended to like someone? | তুমি কি কখনো কাউকে পছন্দ করার ভান করেছো?",
      "❓ If you could erase one memory, what would it be? | যদি তুমি একটি স্মৃতি মুছে ফেলতে পারতে, কোনটা হতো?"
    ];

    const dares = [
      "🔥 Call someone right now and say 'I love you' | এখনই কাউকে কল করে বলো 'আই লাভ ইউ'!",
      "🔥 If you win 10 million today, what will you do first? | আজ ১০ মিলিয়ন টাকা জিতলে প্রথমে কী করবে?",
      "🔥 Have you ever felt like nobody understands you? | কখনো মনে হয়েছে কেউ তোমাকে বুঝে না?",
      "🔥 Type 'I am the cutest here' in the group | গ্রুপে লিখো 'আমি এখানে সবচেয়ে কিউট!'",
      "🔥 Have you ever missed someone silently? | কখনো চুপিচুপি কাউকে খুব মিস করেছো?",
      "🔥 Send the last photo in your gallery to this chat | তোমার গ্যালারির শেষ ছবিটি এই চ্যাটে পাঠাও!",
      "🔥 Speak in rhymes for the next 5 messages | পরের ৫টি মেসেজ ছন্দে বলো!",
      "🔥 Use only emojis for the next 3 messages | পরের ৩টি মেসেজ শুধু ইমোজিতে বলো!"
    ];

    const question = type === "truth"
      ? truths[Math.floor(Math.random() * truths.length)]
      : dares[Math.floor(Math.random() * dares.length)];

    const msg = `${type === "truth" ? "🟢 𝗧𝗥𝗨𝗧𝗛 𝗧𝗜𝗠𝗘" : "🔴 𝗗𝗔𝗥𝗘 𝗧𝗜𝗠𝗘"}\n` +
      `➤ ${name}, ${type === "truth" ? "answer this question honestly" : "complete this dare"}:\n` +
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
  let quoteEN = "", type = "";

  const positiveWords = ["yes", "i did", "sure", "of course", "hoy", "na", "hm", "hmm", "হ্যাঁ", "হ্যা", "done", "complete", "ok"];
  const negativeWords = ["no", "never", "nai", "না", "can't", "cannot", "nope"];

  if (positiveWords.some(word => answer.includes(word))) {
    type = "good";
    const quotes = [
      "Honesty is the best policy.",
      "You’re brave to face the truth.",
      "Nice! You did it."
    ];
    quoteEN = quotes[Math.floor(Math.random() * quotes.length)];
  } else if (negativeWords.some(word => answer.includes(word))) {
    type = "bad";
    const quotes = [
      "The truth can hurt, but it heals.",
      "Next time, try to open up!",
      "It’s okay. We all hesitate sometimes."
    ];
    quoteEN = quotes[Math.floor(Math.random() * quotes.length)];
  } else {
    type = "neutral";
    quoteEN = "your answer!";
  }

  const title = type === "good"
    ? "✅ 𝐆𝐎𝐎𝐃 𝐀𝐍𝐒𝐖𝐄𝐑"
    : type === "bad"
    ? "❌ 𝐁𝐀𝐃 𝐀𝐍𝐒𝐖𝐄𝐑"
    : "ℹ️ 𝐀𝐍𝐒𝐖𝐄𝐑 𝐑𝐄𝐂𝐄𝐈𝐕𝐄𝐃";

  const msg = `${title}\n` +
    `➤ ${handleReply.authorName}\n` +
    `💬 "${quoteEN}"\n` +
    `💬 "${body}"`; // এখানে তার আসল উত্তর দেখাবে

  return api.sendMessage(msg, threadID, messageID);
};
