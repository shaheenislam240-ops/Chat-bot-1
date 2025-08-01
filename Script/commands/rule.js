const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "rules",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Only show 1 rule when 'rules' is typed (supports multiline add)",
  commandCategory: "noprefix",
  usages: "rules / !rules add/remove/all",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

const pathData = path.join(__dirname, "cache", "rules.json");

module.exports.onLoad = () => {
  if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8");
};

module.exports.handleEvent = async ({ event, api }) => {
  const { threadID, body } = event;

  if (!body || body.toLowerCase() !== "rules") return;

  const dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
  const thisThread = dataJson.find(item => item.threadID == threadID);
  if (!thisThread || thisThread.listRule.length === 0)
    return api.sendMessage("⚠️ This group has no rules saved yet.", threadID);

  const lastRule = thisThread.listRule[thisThread.listRule.length - 1];
  return api.sendMessage(`📌 Group Rule:\n${lastRule}`, threadID);
};

module.exports.run = async ({ event, api, args, permssion }) => {
  const { threadID, messageID } = event;
  const dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
  let thisThread = dataJson.find(item => item.threadID == threadID);

  if (!thisThread) {
    thisThread = { threadID, listRule: [] };
    dataJson.push(thisThread);
  }

  const action = args[0]?.toLowerCase();
  const input = event.body.substring(event.body.indexOf(action) + action.length + 1);

  switch (action) {
    case "add": {
      if (permssion == 0) return api.sendMessage("❌ You don't have permission to add rules.", threadID, messageID);
      if (!input || input.length < 3) return api.sendMessage("⚠️ Please provide the rule content.", threadID, messageID);

      thisThread.listRule.push(input.trim());

      fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      return api.sendMessage("✅ Rule added successfully!", threadID, messageID);
    }

    case "remove":
    case "rm":
    case "delete": {
      if (permssion == 0) return api.sendMessage("❌ You don't have permission to remove rules.", threadID, messageID);
      if (!input) return api.sendMessage("⚠️ Please specify the rule number or use 'all'.", threadID, messageID);

      if (input === "all") {
        thisThread.listRule = [];
        fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
        return api.sendMessage("🗑️ All rules have been deleted.", threadID, messageID);
      }

      const index = parseInt(input) - 1;
      if (isNaN(index) || index < 0 || index >= thisThread.listRule.length)
        return api.sendMessage("⚠️ Invalid rule number.", threadID, messageID);

      thisThread.listRule.splice(index, 1);
      fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      return api.sendMessage(`🗑️ Rule number ${input} deleted.`, threadID, messageID);
    }

    case "all":
    case "list": {
      if (!thisThread.listRule.length) return api.sendMessage("⚠️ No rules to show.", threadID, messageID);

      let msg = "";
      thisThread.listRule.forEach((item, i) => {
        msg += `${i + 1}/ ${item}\n`;
      });

      return api.sendMessage(`📜 All Group Rules:\n\n${msg}`, threadID, messageID);
    }

    default: {
      return api.sendMessage(
        "📘 Command Usage:\n" +
        "• !rules add [text] — Add a new (multi-line) rule\n" +
        "• !rules remove [number/all] — Remove a rule\n" +
        "• rules — Show the latest rule (noprefix)",
        threadID, messageID
      );
    }
  }
};
