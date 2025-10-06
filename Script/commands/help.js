const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "help",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Auto-detect command categories and show all command list dynamically",
  commandCategory: "system",
  usages: "[command name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX || "!";
  const { commands } = global.client;

  // ✅ If user wants help for specific command
  if (args[0]) {
    const cmd = commands.get(args[0].toLowerCase());
    if (!cmd)
      return api.sendMessage(`❌ Command '${args[0]}' not found.`, threadID, messageID);

    const c = cmd.config;
    const usage = c.usages ? `${prefix}${c.name} ${c.usages}` : `${prefix}${c.name}`;
    const info = `╭──────•◈•──────╮
│ Name: ${c.name}
│ Description: ${c.description || "No description"}
│ Usage: ${usage}
│ Category: ${c.commandCategory || "Other"}
│ Cooldown: ${c.cooldowns || 0}s
│ Permission: ${c.hasPermssion || 0}
╰──────•◈•──────╯`;
    return api.sendMessage(info, threadID, messageID);
  }

  // ✅ Auto-detect all command categories
  const commandDir = path.join(__dirname, ".."); // assuming this file is inside modules/commands/
  const categoryMap = {};

  const files = fs.readdirSync(commandDir).filter(file => file.endsWith(".js"));
  for (const file of files) {
    try {
      const cmd = require(path.join(commandDir, file));
      const cat = cmd.config.commandCategory || "Other";
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(cmd.config.name);
    } catch (err) {
      console.log(`⚠️ Failed to load ${file}:`, err.message);
    }
  }

  // ✅ Create dynamic formatted message
  let msg = `✨ 𝗔𝗨𝗧𝗢 𝗗𝗘𝗧𝗘𝗖𝗧 𝗛𝗘𝗟𝗣 ✨
╭────────────╮
│ Total Commands: ${Object.values(categoryMap).flat().length}
│ Prefix: ${prefix}
╰────────────╯\n`;

  for (const cat of Object.keys(categoryMap).sort()) {
    const cmds = categoryMap[cat]
      .sort((a, b) => a.localeCompare(b))
      .map(name => `★${name}`)
      .join("  ");
    msg += `\n╭─── ${cat.toUpperCase()} ───╮\n│ ${cmds}\n╰────────────⧕\n`;
  }

  msg += `\nType: ${prefix}help [command name] for details
CEO: Maria 🧃🐣
Admin: rX Abdullah`;

  // ✅ Optional GIF (if available)
  const gifPath = path.join(__dirname, "cache", "help.gif");
  if (fs.existsSync(gifPath)) {
    return api.sendMessage(
      { body: msg, attachment: fs.createReadStream(gifPath) },
      threadID,
      messageID
    );
  } else {
    return api.sendMessage(msg, threadID, messageID);
  }
};
