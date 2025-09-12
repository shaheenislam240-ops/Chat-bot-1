module.exports.config = {
  name: "listban",
  version: "1.0.1",
  credits: "rX Abdullah (fixed by ChatGPT)",
  hasPermssion: 2,
  description: "Show list of banned threads or users (framed)",
  commandCategory: "System",
  usages: "listban thread/user",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply, Threads, Users }) {
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  const index = parseInt(event.body.trim());
  if (isNaN(index) || index < 1 || index > handleReply.listID.length) {
    return api.sendMessage("⚠ Invalid number!", event.threadID, event.messageID);
  }

  const targetID = handleReply.listID[index - 1];

  switch (handleReply.type) {
    case "thread": {
      let data = (await Threads.getData(targetID)).data || {};
      data.banned = 0;
      await Threads.setData(targetID, { data });
      global.data.threadBanned.delete(parseInt(targetID));
      return api.sendMessage(`✅ Unbanned thread:\n${targetID}`, event.threadID, event.messageID);
    }

    case "user": {
      let data = (await Users.getData(targetID)).data || {};
      data.banned = 0;
      await Users.setData(targetID, { data });
      global.data.userBanned.delete(parseInt(targetID));
      return api.sendMessage(`✅ Unbanned user:\n${targetID}`, event.threadID, event.messageID);
    }
  }
};

module.exports.run = async function ({ api, event, args, Threads, Users }) {
  const type = args[0];
  if (!type || !["thread", "user"].includes(type)) {
    return api.sendMessage("⚠ Usage: listban thread OR listban user", event.threadID, event.messageID);
  }

  // helper to build framed block for each item
  const buildFrame = (titleLines, items, footerNote) => {
    // top border and title
    let msg = '╭───× 𝐛𝐚𝐧 𝐥𝐢𝐬𝐭 ×───╮\n';
    for (const ln of titleLines) msg += `│ ${ln}\n`;
    msg += '│ ───× \n';
    // items: already formatted strings with name/id
    for (const it of items) {
      msg += `│ ${it}\n`;
      msg += '│ ───× \n';
    }
    msg += '╰─────────────⧕\n';
    if (footerNote) msg += `\n${footerNote}`;
    return msg;
  };

  if (type === "thread") {
    const bannedThreads = Array.from(global.data.threadBanned.keys());
    if (bannedThreads.length === 0) return api.sendMessage("✅ No banned threads found!", event.threadID, event.messageID);

    let listItems = [];
    let listID = [];
    let i = 1;
    for (const tid of bannedThreads) {
      const threadData = (await Threads.getData(tid)) || {};
      const name = threadData.threadInfo?.threadName || "Unknown";
      listItems.push(`${i}. ${name} — TID: ${tid}`);
      listID.push(tid);
      i++;
    }

    const titleLines = ["ᰔ𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭"];
    const footerNote = '✨ Reply with the number (e.g. 1) to unban that group.';
    const msg = buildFrame(titleLines, listItems, footerNote);

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        author: event.senderID,
        messageID: info.messageID,
        listID,
        type: "thread"
      });
    });
  }

  if (type === "user") {
    const bannedUsers = Array.from(global.data.userBanned.keys());
    if (bannedUsers.length === 0) return api.sendMessage("✅ No banned users found!", event.threadID, event.messageID);

    let listItems = [];
    let listID = [];
    let i = 1;
    for (const uid of bannedUsers) {
      const name = global.data.userName.get(uid) || (await Users.getNameUser(uid)) || "Unknown";
      listItems.push(`${i}. ${name} — ID: ${uid}`);
      listID.push(uid);
      i++;
    }

    const titleLines = ["ᰔ𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭"];
    const footerNote = '✨ Reply with the number (e.g. 1) to unban that user.';
    const msg = buildFrame(titleLines, listItems, footerNote);

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        author: event.senderID,
        messageID: info.messageID,
        listID,
        type: "user"
      });
    });
  }
};
