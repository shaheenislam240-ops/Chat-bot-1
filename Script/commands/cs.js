const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "cs",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  usePrefix: true,
  description: "Show command store",
  commandCategory: "system",
  usages: "[page number]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    // 👉 এখন শুধু এই ফোল্ডারের ভেতর (commands) থেকে ফাইল নেবে
    const commandDir = __dirname;  
    const files = fs.readdirSync(commandDir).filter(file => file.endsWith(".js"));

    let commands = [];
    for (let i = 0; i < files.length; i++) {
      try {
        let cmd = require(path.join(commandDir, files[i]));
        if (!cmd.config) continue; // config না থাকলে skip করবে

        commands.push({
          name: cmd.config.name || files[i].replace(".js", ""),
          author: cmd.config.credits || "Unknown",
          update: cmd.config.update || cmd.config.version || "N/A",
          usage: (global.config.PREFIX || "!") + (cmd.config.name || files[i].replace(".js", ""))
        });
      } catch (e) {}
    }

    // Pagination
    let page = parseInt(args[0]) || 1;
    let limit = 10; 
    let totalPages = Math.ceil(commands.length / limit);

    if (totalPages === 0) {
      return api.sendMessage("❌ No commands found.", event.threadID, event.messageID);
    }

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    let start = (page - 1) * limit;
    let end = start + limit;
    let list = commands.slice(start, end);

    let msg = "╭───✦ Cmd Store ✦───╮\n";
    msg += `│ Page ${page} of ${totalPages} page(s)\n`;
    msg += `│ Total ${commands.length} commands\n`;

    list.forEach((cmd, i) => {
      msg += `│ ───✦ ${start + i + 1}. ${cmd.name}\n`;
      msg += `│ AUTHOR: ${cmd.author}\n`;
      msg += `│ USING: ${cmd.usage}\n`;
      msg += `│ UPDATE: ${cmd.update}\n`;
    });

    msg += "╰─────────────⧕\n";
    if (page < totalPages) {
      msg += `Type "${global.config.PREFIX}cs ${page + 1}" for more commands.`;
    }

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (err) {
    api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
  }
};
