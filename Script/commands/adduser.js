module.exports.config = {
  name: "adduser",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "CYBER ☢️ BOT TEAM ☢️ + Rx Edit",
  description: "Add user to the group by link or id or reply",
  commandCategory: "group",
  usages: "[id | link | reply]",
  cooldowns: 5,
};

async function getUID(url, api) {
  if (!url.includes("facebook.com")) return [null, null, true];
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      let data = await api.httpGet(url);
      let regexid = /"userID":"(\d+)"/.exec(data);
      let nameMatch = /"title":"(.*?)"/.exec(data);
      let name = nameMatch ? JSON.parse(`{"name":"${nameMatch[1]}"}`).name : null;
      return [regexid ? regexid[1] : null, name, false];
    }
    return [null, null, true];
  } catch {
    return [null, null, true];
  }
}

module.exports.run = async function ({ api, event, args, config }) {
  const { threadID, messageID, senderID } = event;
  const botID = api.getCurrentUserID();
  const out = (msg) => api.sendMessage(msg, threadID, messageID);

  // Thread info আনব
  let info = await api.getThreadInfo(threadID);
  let { participantIDs, approvalMode, adminIDs } = info;
  let participants = participantIDs.map((e) => parseInt(e));
  const threadAdmins = adminIDs.map((e) => e.id);

  // ✅ Admin check (Bot-admin config + Thread-admin)
  if (!config.ADMINBOT.includes(senderID) && !threadAdmins.includes(senderID)) {
    return out("❌ Only Bot Admins or Group Admins can use this command.");
  }

  // ✅ Case 1: Reply system
  if (event.type == "message_reply" && !args[0]) {
    const uid = parseInt(event.messageReply.senderID);
    if (participants.includes(uid)) return out("⚠️ This member is already in the group.");
    else return adduser(uid, "Replied User");
  }

  // ✅ Case 2: ID or Link
  if (!args[0]) return out("⚠️ Please enter 1 id/link or reply to a message.");
  if (!isNaN(args[0])) return adduser(args[0], undefined);
  else {
    try {
      let [id, name, fail] = await getUID(args[0], api);
      if (fail == true && id != null) return out(id);
      else if (fail == true && id == null) return out("❌ User ID not found.");
      else {
        await adduser(id, name || "Facebook user");
      }
    } catch (e) {
      return out(`${e.name}: ${e.message}.`);
    }
  }

  // ===== Add user function =====
  async function adduser(id, name) {
    id = parseInt(id);
    if (participants.includes(id)) return out(`${name ? name : "Member"} is already in the group.`);
    else {
      let admins = adminIDs.map((e) => parseInt(e.id));
      try {
        await api.addUserToGroup(id, threadID);
      } catch {
        return out(`❌ Can't add ${name ? name : "user"} to group.`);
      }
      if (approvalMode === true && !admins.includes(botID))
        return out(`✅ Added ${name ? name : "member"} to the approved list !`);
      else return out(`✅ Added ${name ? name : "member"} to group !`);
    }
  }
};
