const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "help",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "rX",
  usePrefix: true,
  description: "Auto detects all commands and groups by category in styled format",
  commandCategory: "system",
  usages: "[command name]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const commandDir = __dirname;
    const files = fs.readdirSync(commandDir).filter(f => f.endsWith(".js"));

    let commands = [];
    for (let file of files) {
      try {
        const cmd = require(path.join(commandDir, file));
        if (!cmd.config) continue;
        commands.push({
          name: cmd.config.name || file.replace(".js", ""),
          category: cmd.config.commandCategory || "Other",
          description: cmd.config.description || "No description available.",
          author: cmd.config.credits || "Unknown",
          version: cmd.config.version || "N/A",
          usages: cmd.config.usages || "No usage info",
          cooldowns: cmd.config.cooldowns || "N/A",
        });
      } catch (e) {}
    }

    // if user uses !help [command]
    if (args[0]) {
      const name = args[0].toLowerCase();
      const cmd = commands.find(c => c.name.toLowerCase() === name);
      if (!cmd) return api.sendMessage(`❌ Command "${name}" not found.`, event.threadID, event.messageID);

      let msg = `╭──❏ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟 ❏──╮\n`;
      msg += `│ ✧ Name: ${cmd.name}\n`;
      msg += `│ ✧ Category: ${cmd.category}\n`;
      msg += `│ ✧ Version: ${cmd.version}\n`;
      msg += `│ ✧ Author: ${cmd.author}\n`;
      msg += `│ ✧ Cooldowns: ${cmd.cooldowns}s\n`;
      msg += `╰─────────────────────⭓\n`;
      msg += `📘 Description: ${cmd.description}\n`;
      msg += `📗 Usage: ${global.config.PREFIX || "!"}${cmd.name} ${cmd.usages}`;

      api.sendMessage(msg, event.threadID, (err, info) => {
        if (!err) {
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 10000); // 10 seconds
        }
      }, event.messageID);
      return;
    }

    // group by category
    const categories = {};
    for (let cmd of commands) {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd.name);
    }

    // start menu
    let msg = `╭──❏ 𝐀𝐮𝐭𝐨 𝐃𝐞𝐭𝐞𝐜𝐭 𝐇𝐞𝐥𝐩 ❏──╮\n`;
    msg += `│ ✧ Total Commands: ${commands.length}\n`;
    msg += `│ ✧ Prefix: ${global.config.PREFIX || "!"}\n`;
    msg += `╰─────────────────────⭓\n\n`;

    // loop each category with box style
    for (let [cat, cmds] of Object.entries(categories)) {
      msg += `╭─────⭓ ${cat.toUpperCase()}\n`;
      msg += `│ ${cmds.map(n => `✧${n}`).join(" ✧")}\n`;
      msg += `╰────────────⭓\n\n`;
    }

    msg += `⭔ Type ${global.config.PREFIX || "!"}help [command] to see details\n`;
    msg += `╭─[⋆˚🦋𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗🎀⋆˚]\n`;
    msg += `╰‣ 𝐀𝐝𝐦𝐢𝐧 : 𝐫𝐗 𝐀𝐛𝐝𝐮𝐥𝐥𝐚𝐡\n`;

    api.sendMessage(msg, event.threadID, (err, info) => {
      if (!err) {
        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 15000); // auto unsend after 15 sec
      }
    }, event.messageID);

  } catch (err) {
    api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
  }
};
