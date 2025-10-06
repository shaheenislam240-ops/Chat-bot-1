const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "help",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  usePrefix: true,
  description: "Auto detect help menu with command details",
  commandCategory: "system",
  usages: "[command name]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const commandDir = __dirname;
    const files = fs.readdirSync(commandDir).filter(file => file.endsWith(".js"));

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

    // যদি !help [cmd] হয়
    if (args[0]) {
      const name = args[0].toLowerCase();
      const cmd = commands.find(c => c.name.toLowerCase() === name);
      if (!cmd) return api.sendMessage(`❌ Command "${name}" not found.`, event.threadID, event.messageID);

      let msg = `✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟 ✨\n`;
      msg += `╭────────────╮\n`;
      msg += `│ Command: ${cmd.name}\n`;
      msg += `│ Category: ${cmd.category}\n`;
      msg += `│ Version: ${cmd.version}\n`;
      msg += `│ Author: ${cmd.author}\n`;
      msg += `│ Cooldowns: ${cmd.cooldowns}s\n`;
      msg += `╰────────────╯\n`;
      msg += `📘 Description: ${cmd.description}\n`;
      msg += `📗 Usage: ${global.config.PREFIX || "!"}${cmd.name} ${cmd.usages}\n`;
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // না হলে সব কমান্ড + category show করবে
    const categories = {};
    for (let cmd of commands) {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd.name);
    }

    let msg = `✨ 𝗔𝗨𝗧𝗢 𝗗𝗘𝗧𝗘𝗖𝗧 𝗛𝗘𝗟𝗣 ✨\n`;
    msg += `╭────────────╮\n`;
    msg += `│ Total Commands: ${commands.length}\n`;
    msg += `│ Prefix: ${global.config.PREFIX || "!"}\n`;
    msg += `╰────────────╯\n\n`;

    for (let [cat, cmds] of Object.entries(categories)) {
      msg += `📂 ${cat.toUpperCase()} (${cmds.length})\n`;
      msg += `» ${cmds.join(", ")}\n\n`;
    }

    msg += `Type: ${global.config.PREFIX || "!"}help [command name] for details\n`;
    msg += `CEO: Maria 🧃🐣\n`;
    msg += `Admin: rX Abdullah`;

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (err) {
    api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
  }
};
