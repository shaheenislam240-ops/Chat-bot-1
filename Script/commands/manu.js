const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "cache");
const CONF_PATH = path.join(DATA_DIR, "manu.config.json");
const DISABLED_CMDS_PATH = path.join(DATA_DIR, "disabled.commands.json");
const BLOCKED_THREADS_PATH = path.join(DATA_DIR, "blocked.threads.json");
const COMMANDS_DIR = path.join(__dirname); // this file's folder (commands)

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONF_PATH)) fs.writeFileSync(CONF_PATH, JSON.stringify({
    setupDone: false,
    prefix: "",            //optional storage; won’t override bot core
    ownerNote: "Welcome to MANU Control Center"
  }, null, 2));
  if (!fs.existsSync(DISABLED_CMDS_PATH)) fs.writeFileSync(DISABLED_CMDS_PATH, JSON.stringify([], null, 2));
  if (!fs.existsSync(BLOCKED_THREADS_PATH)) fs.writeFileSync(BLOCKED_THREADS_PATH, JSON.stringify([], null, 2));
}

function readJSON(p) {
  ensureFiles();
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; }
}
function writeJSON(p, data) {
  ensureFiles();
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function listCommands() {
  // List *.js in commands folder (excluding this file)
  const files = fs.readdirSync(COMMANDS_DIR)
    .filter(f => f.endsWith(".js") && f !== path.basename(__filename))
    .map(f => f.replace(/\.js$/, ""));
  return files;
}

module.exports.config = {
  name: "manu",
  version: "1.0.0",
  hasPermssion: 2, // admin only (change to 0 if you want)
  credits: "rX Abdullah + ChatGPT",
  description: "Bot Control Center (Menu + Setup)",
  commandCategory: "system",
  usages: "manu",
  cooldowns: 2
};

// ভাষা (সংক্ষিপ্ত)
const T = {
  title: "🔧 MANU • Control Center",
  ask: "যে অপশনটি চান তার নম্বর রিপ্লাই করুন:",
  opts: [
    "Setup / Finish setup",
    "Show current status",
    "Toggle a command ON/OFF",
    "Delete a command file (safe)",
    "Turn BOT OFF in this chat",
    "Turn BOT ON in this chat",
    "Restart bot (process.exit)"
  ],
  done: "✅ সম্পন্ন!",
  cancel: "❌ বাতিল করা হলো।",
  needAdmin: "এই অপশন চালাতে অ্যাডমিন পারমিশন লাগে।",
  confirmDel: (name)=>`আপনি কি নিশ্চিত যে “${name}.js” ডিলিট করতে চান? (yes/no)`,
  notFound: "কমান্ড পাওয়া যায়নি।",
  already: "ইতোমধ্যেই সেট ছিল।",
  turnedOff: "এই থ্রেডে বট OFF করা হলো।",
  turnedOn: "এই থ্রেডে বট ON করা হলো।"
};

// গ্লোবাল গার্ড: setupDone না হলে—setup এর দিকে রিডাইরেক্ট
module.exports.handleEvent = async function({ api, event }) {
  try {
    if (!event || !event.body) return;
    ensureFiles();
    const conf = readJSON(CONF_PATH);
    const blockedThreads = readJSON(BLOCKED_THREADS_PATH);
    const isBlocked = Array.isArray(blockedThreads) && blockedThreads.includes(event.threadID);

    // ব্লক থাকলে শুধু অ্যাডমিন/ম্যানু ছাড়া কিছুই চলবে না
    if (isBlocked) return;

    if (!conf.setupDone) {
      // শুধুমাত্র যখন কোনো অন্য কমান্ড ব্যবহার করার চেষ্টা (সহজভাবে: স্ল্যাশ/প্রিফিক্স টেক্সট) তখন গাইড দেই
      const body = (event.body || "").trim();
      const looksLikeCmd = /^[!/.#]/.test(body) && !/^manu(\s|$)/i.test(body);
      if (looksLikeCmd) {
        api.sendMessage(
          "🛠️ প্রথমে বট কুইক সেটআপ সম্পন্ন করুন।\n👉 `manu` লিখে মেনু খুলুন, তারপর 1 নম্বর দিন (Setup).",
          event.threadID
        );
      }
    }
  } catch {}
};

// মূল কমান্ড রান
module.exports.run = async function({ api, event, args }) {
  ensureFiles();
  const disabled = readJSON(DISABLED_CMDS_PATH);
  const conf = readJSON(CONF_PATH);
  const blockedThreads = readJSON(BLOCKED_THREADS_PATH);

  // মেনু বানানো
  const statusLines = [
    `• Setup: ${conf.setupDone ? "✅ Done" : "❌ Not done"}`,
    `• Owner note: ${conf.ownerNote || "-"}`,
    `• This thread: ${blockedThreads.includes(event.threadID) ? "🚫 BOT OFF" : "🟢 BOT ON"}`
  ];

  const menu =
`${T.title}
${statusLines.join("\n")}

1) ${T.opts[0]}
2) ${T.opts[1]}
3) ${T.opts[2]}
4) ${T.opts[3]}
5) ${T.opts[4]}
6) ${T.opts[5]}
7) ${T.opts[6]}

${T.ask}`;

  return api.sendMessage(menu, event.threadID, (err, info) => {
    if (err) return;
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      type: "menu"
    });
  });
};

// রিপ্লাই হ্যান্ডলার
module.exports.handleReply = async function (o) {
  const { api, event, handleReply } = o;
  if (event.senderID != handleReply.author) return;
  ensureFiles();

  const conf = readJSON(CONF_PATH);
  const disabled = readJSON(DISABLED_CMDS_PATH);
  const blockedThreads = readJSON(BLOCKED_THREADS_PATH);

  const reply = (msg, cb) => api.sendMessage(msg, event.threadID, cb);

  // মেনু লেভেল
  if (handleReply.type === "menu") {
    const choice = (event.body || "").trim();

    switch (choice) {
      case "1": {
        // Setup flow
        const q =
`⚙️ Quick Setup
1) Set owner note
2) Mark setup as DONE
3) Mark setup as NOT DONE
0) Back

${T.ask}`;
        return reply(q, (err, info) => {
          if (err) return;
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "setupMenu"
          });
        });
      }
      case "2": {
        // Show status
        const cmds = listCommands();
        const disabledSet = new Set(disabled);
        const lines = cmds.slice(0, 40).map(n => `• ${n} ${disabledSet.has(n) ? "— OFF" : "— ON"}`);
        return reply(`📊 Current Status:\n- Setup: ${conf.setupDone ? "✅ Done" : "❌ Not done"}\n- Owner note: ${conf.ownerNote || "-"}\n- Thread: ${blockedThreads.includes(event.threadID) ? "🚫 BOT OFF" : "🟢 BOT ON"}\n\n🧩 Commands (${lines.length} shown):\n${lines.join("\n")}`);
      }
      case "3": {
        // Toggle command ON/OFF
        const list = listCommands();
        if (list.length === 0) return reply("কোনো কমান্ড পাওয়া যায়নি।");
        const menu = list.map((n,i)=>`${i+1}) ${n}`).join("\n");
        return reply(`🔁 কোন কমান্ড ON/OFF করবেন?\n${menu}\n\n${T.ask}`, (err, info) => {
          if (err) return;
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "togglePick",
            cmds: list
          });
        });
      }
      case "4": {
        // Delete command (safe)
        const list = listCommands();
        if (list.length === 0) return reply("কোনো কমান্ড পাওয়া যায়নি।");
        const menu = list.map((n,i)=>`${i+1}) ${n}`).join("\n");
        return reply(`🗑️ কোন কমান্ড ফাইল ডিলিট করবেন?\n${menu}\n\n${T.ask}`, (err, info) => {
          if (err) return;
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "deletePick",
            cmds: list
          });
        });
      }
      case "5": {
        // Turn bot OFF in this chat
        if (!blockedThreads.includes(event.threadID)) {
          blockedThreads.push(event.threadID);
          writeJSON(BLOCKED_THREADS_PATH, blockedThreads);
        }
        return reply(T.turnedOff);
      }
      case "6": {
        // Turn bot ON in this chat
        const idx = blockedThreads.indexOf(event.threadID);
        if (idx !== -1) {
          blockedThreads.splice(idx,1);
          writeJSON(BLOCKED_THREADS_PATH, blockedThreads);
          return reply(T.turnedOn);
        }
        return reply(T.already);
      }
      case "7": {
        reply("♻️ রিস্টার্ট হচ্ছে...", () => {
          // ছােট্ট ডিলে দিয়ে রিস্টার্ট
          setTimeout(()=>process.exit(1), 500);
        });
        return;
      }
      default:
        return reply(T.cancel);
    }
  }

  // Setup submenu
  if (handleReply.type === "setupMenu") {
    const choice = (event.body || "").trim();
    switch (choice) {
      case "1": {
        return reply("✍️ Owner note লিখে পাঠান:", (err, info) => {
          if (err) return;
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "ownerNote"
          });
        });
      }
      case "2": {
        conf.setupDone = true;
        writeJSON(CONF_PATH, conf);
        return reply("✅ Setup DONE হিসেবে মার্ক হলো।");
      }
      case "3": {
        conf.setupDone = false;
        writeJSON(CONF_PATH, conf);
        return reply("🔄 Setup NOT DONE হিসেবে মার্ক হলো।");
      }
      case "0":
      default:
        return reply(T.cancel);
    }
  }

  if (handleReply.type === "ownerNote") {
    conf.ownerNote = (event.body || "").trim().slice(0, 200);
    writeJSON(CONF_PATH, conf);
    return api.sendMessage(T.done, event.threadID);
  }

  // Toggle pick
  if (handleReply.type === "togglePick") {
    const idx = parseInt((event.body||"").trim(), 10) - 1;
    const list = handleReply.cmds || [];
    if (!(idx >=0 && idx < list.length)) return api.sendMessage("ভুল নম্বর!", event.threadID);
    const name = list[idx];
    let disabled = readJSON(DISABLED_CMDS_PATH);
    if (!Array.isArray(disabled)) disabled = [];

    if (disabled.includes(name)) {
      disabled = disabled.filter(n => n !== name);
      writeJSON(DISABLED_CMDS_PATH, disabled);
      return api.sendMessage(`✅ ${name} এখন ON`, event.threadID);
    } else {
      disabled.push(name);
      writeJSON(DISABLED_CMDS_PATH, disabled);
      return api.sendMessage(`🚫 ${name} এখন OFF`, event.threadID);
    }
  }

  // Delete pick -> confirm
  if (handleReply.type === "deletePick") {
    const idx = parseInt((event.body||"").trim(), 10) - 1;
    const list = handleReply.cmds || [];
    if (!(idx >=0 && idx < list.length)) return api.sendMessage("ভুল নম্বর!", event.threadID);
    const name = list[idx];

    return api.sendMessage(T.confirmDel(name), event.threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        type: "confirmDelete",
        cmdName: name
      });
    });
  }

  if (handleReply.type === "confirmDelete") {
    const ans = (event.body||"").trim().toLowerCase();
    const name = handleReply.cmdName;
    if (!["yes","y","no","n"].includes(ans)) {
      return api.sendMessage("Please reply yes/no", event.threadID);
    }
    if (ans.startsWith("n")) return api.sendMessage(T.cancel, event.threadID);

    // নিরাপদ ডিলিট
    const safeName = name.replace(/[^a-z0-9_\-]/gi, "");
    const target = path.join(COMMANDS_DIR, `${safeName}.js`);
    if (!fs.existsSync(target)) return api.sendMessage(T.notFound, event.threadID);

    try {
      fs.unlinkSync(target);
      // যদি OFF লিস্টে থাকে—তাও সরাই
      let disabled = readJSON(DISABLED_CMDS_PATH);
      if (Array.isArray(disabled)) {
        disabled = disabled.filter(n => n !== safeName);
        writeJSON(DISABLED_CMDS_PATH, disabled);
      }
      return api.sendMessage(`🗑️ ডিলিট সম্পন্ন: ${safeName}.js`, event.threadID);
    } catch (e) {
      return api.sendMessage(`❌ ডিলিট ব্যর্থ: ${e.message}`, event.threadID);
    }
  }
};

// ===== Optional helper (middleware idea) =====
// আপনি চাইলে আপনার বটের command handler-এ DISABLED_CMDS_PATH পড়ে
// যেসব কমান্ড disabled তালিকায় আছে সেগুলো স্কিপ করতে পারেন।
// নিচে শুধু রেফারেন্স লজিক (ফ্রেমওয়ার্ক-লেভেল ইন্টিগ্রেশন দরকার):

/*
globalBypassCheck = function(commandName, threadID) {
  const disabled = readJSON(DISABLED_CMDS_PATH);
  const blocked = readJSON(BLOCKED_THREADS_PATH);
  if (Array.isArray(blocked) && blocked.includes(threadID)) return false; // block all
  if (Array.isArray(disabled) && disabled.includes(commandName)) return false; // this cmd off
  return true; // allow
};
*/
