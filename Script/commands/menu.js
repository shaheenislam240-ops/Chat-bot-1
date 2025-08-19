const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "cache");
const DISABLED_CMDS_PATH = path.join(DATA_DIR, "disabled.commands.json");
const BLOCKED_THREADS_PATH = path.join(DATA_DIR, "blocked.threads.json");
const COMMANDS_DIR = path.join(__dirname); // this file's folder (commands)

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
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
  const files = fs.readdirSync(COMMANDS_DIR)
    .filter(f => f.endsWith(".js") && f !== path.basename(__filename))
    .map(f => f.replace(/\.js$/, ""));
  return files;
}

module.exports.config = {
  name: "menu", // 🔥 এখন menu কমান্ড হবে
  version: "1.1.0",
  hasPermssion: 2,
  credits: "rX Abdullah + ChatGPT",
  description: "Bot Control Center (Menu Only)",
  commandCategory: "system",
  usages: "menu",
  cooldowns: 2
};

const T = {
  title: "🔧 MENU • Control Center",
  ask: "Reply with the number of the option you want:",
  opts: [
    "Show current status",
    "Toggle a command ON/OFF",
    "Delete a command file (safe)",
    "Turn BOT OFF in this chat",
    "Turn BOT ON in this chat",
    "Restart bot (process.exit)"
  ],
  done: "✅ Done!",
  cancel: "❌ Cancelled.",
  confirmDel: (name)=>`Are you sure you want to delete “${name}.js”? (yes/no)`,
  notFound: "Command not found.",
  already: "Already set.",
  turnedOff: "BOT is now OFF in this chat.",
  turnedOn: "BOT is now ON in this chat."
};

module.exports.run = async function({ api, event }) {
  ensureFiles();
  const disabled = readJSON(DISABLED_CMDS_PATH);
  const blockedThreads = readJSON(BLOCKED_THREADS_PATH);

  const statusLines = [
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

module.exports.handleReply = async function (o) {
  const { api, event, handleReply } = o;
  if (event.senderID != handleReply.author) return;
  ensureFiles();

  const disabled = readJSON(DISABLED_CMDS_PATH);
  const blockedThreads = readJSON(BLOCKED_THREADS_PATH);

  const reply = (msg, cb) => api.sendMessage(msg, event.threadID, cb);

  if (handleReply.type === "menu") {
    const choice = (event.body || "").trim();

    switch (choice) {
      case "1": {
        const cmds = listCommands();
        const disabledSet = new Set(disabled);
        const lines = cmds.slice(0, 40).map(n => `• ${n} ${disabledSet.has(n) ? "— OFF" : "— ON"}`);
        return reply(`📊 Status:\n- Thread: ${blockedThreads.includes(event.threadID) ? "🚫 BOT OFF" : "🟢 BOT ON"}\n\n🧩 Commands (${lines.length} shown):\n${lines.join("\n")}`);
      }
      case "2": {
        const list = listCommands();
        if (list.length === 0) return reply("No commands found.");
        const menu = list.map((n,i)=>`${i+1}) ${n}`).join("\n");
        return reply(`🔁 Choose a command to toggle ON/OFF:\n${menu}\n\n${T.ask}`, (err, info) => {
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
      case "3": {
        const list = listCommands();
        if (list.length === 0) return reply("No commands found.");
        const menu = list.map((n,i)=>`${i+1}) ${n}`).join("\n");
        return reply(`🗑️ Choose a command file to delete:\n${menu}\n\n${T.ask}`, (err, info) => {
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
      case "4": {
        if (!blockedThreads.includes(event.threadID)) {
          blockedThreads.push(event.threadID);
          writeJSON(BLOCKED_THREADS_PATH, blockedThreads);
        }
        return reply(T.turnedOff);
      }
      case "5": {
        const idx = blockedThreads.indexOf(event.threadID);
        if (idx !== -1) {
          blockedThreads.splice(idx,1);
          writeJSON(BLOCKED_THREADS_PATH, blockedThreads);
          return reply(T.turnedOn);
        }
        return reply(T.already);
      }
      case "6": {
        reply("♻️ Restarting...", () => setTimeout(()=>process.exit(1), 500));
        return;
      }
      default:
        return reply(T.cancel);
    }
  }

  if (handleReply.type === "togglePick") {
    const idx = parseInt((event.body||"").trim(), 10) - 1;
    const list = handleReply.cmds || [];
    if (!(idx >=0 && idx < list.length)) return api.sendMessage("Invalid number!", event.threadID);
    const name = list[idx];
    let disabled = readJSON(DISABLED_CMDS_PATH);
    if (!Array.isArray(disabled)) disabled = [];

    if (disabled.includes(name)) {
      disabled = disabled.filter(n => n !== name);
      writeJSON(DISABLED_CMDS_PATH, disabled);
      return api.sendMessage(`✅ ${name} is now ON`, event.threadID);
    } else {
      disabled.push(name);
      writeJSON(DISABLED_CMDS_PATH, disabled);
      return api.sendMessage(`🚫 ${name} is now OFF`, event.threadID);
    }
  }

  if (handleReply.type === "deletePick") {
    const idx = parseInt((event.body||"").trim(), 10) - 1;
    const list = handleReply.cmds || [];
    if (!(idx >=0 && idx < list.length)) return api.sendMessage("Invalid number!", event.threadID);
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

    const safeName = name.replace(/[^a-z0-9_\-]/gi, "");
    const target = path.join(COMMANDS_DIR, `${safeName}.js`);
    if (!fs.existsSync(target)) return api.sendMessage(T.notFound, event.threadID);

    try {
      fs.unlinkSync(target);
      let disabled = readJSON(DISABLED_CMDS_PATH);
      if (Array.isArray(disabled)) {
        disabled = disabled.filter(n => n !== safeName);
        writeJSON(DISABLED_CMDS_PATH, disabled);
      }
      return api.sendMessage(`🗑️ Deleted: ${safeName}.js`, event.threadID);
    } catch (e) {
      return api.sendMessage(`❌ Delete failed: ${e.message}`, event.threadID);
    }
  }
};
