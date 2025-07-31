module.exports.config = {
  name: "help",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "rX", //don't change this cradite
  description: "Show all command list",
  commandCategory: "system",
  usages: "[name module]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 30
  }
};

module.exports.languages = {
  "en": {
    "moduleInfo": `╭──────•◈•──────╮\n |        𝗿𝗫 𝗖𝗵𝗮𝘁 𝗕𝗼𝘁\n |●𝗡𝗮𝗺𝗲: •—» %1 «—•\n |●𝗨𝘀𝗮𝗴𝗲: %3\n |●𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: %2\n |●𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: %4\n |●𝗪𝗮𝗶𝘁𝗶𝗻𝗴 𝘁𝗶𝗺𝗲: %5 second(s)\n |●𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻: %6\n |𝗠𝗼𝗱𝘂𝗹𝗲 𝗰𝗼𝗱𝗲 𝗯𝘆\n |•—» rX Abdullah «—•\n╰──────•◈•──────╯`,
    "user": "User",
    "adminGroup": "Admin group",
    "adminBot": "Admin bot"
  }
};

module.exports.run = function ({ api, event, args }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const totalCmds = commands.size;

  const message = `✨ [ Guide For Beginners - ] ✨

╭──── [ 𝗖𝗛𝗔𝗧 𝗔𝗜 ]
│ ✧ baby✧ bby✧ jan✧
│ ✧ maria✧ hippi✧ 
│ ✧ maria rani✧ bbz
╰───────────────◊
╭──── [ UTILITY ]
│ ✧ accept✧ adc✧ age
│ ✧ anime✧ commandcount✧ covid
│ ✧ curlconverter✧ giphy✧ googleimg
│ ✧ image✧ ip✧ math
│ ✧ ocr✧ splitimage✧ ss
│ ✧ translate✧ uid✧ unsend
│ ✧ uptime✧ weather✧ worldclock
╰───────────────◊
╭──── [ BOX CHAT ]
│ ✧ onlyadminbox✧ admin✧
│ ✧ autosetname✧ badwords✧ ban
│ ✧ groupinfo✧ count✧ filteruser
│ ✧ kick✧ refresh✧ rules
│ ✧ sendnoti✧ setname✧ warn
│ ✧ ckbot✧ 0admin✧ emojis
╰───────────────◊
╭──── [ SYSTEM ]
│ ✧ adduser✧ all✧ ckban
│ ✧ delete✧ fakechat✧ help
│ ✧ out✧ restart✧ rr
│ ✧ shell✧ spam✧ vip
╰───────────────◊
╭──── [ LOVE ]
│ ✧ pair✧ pair1✧ love
│ ✧ kiss✧ gf✧ bf
│ ✧ bestu✧ bestie✧ match✧
╰───────────────◊
╭──── [ VOICE & PHOTOS ]
│ ✧ ekta gan bolo✧ ghumabo
│ ✧ i love you✧ voice✧ holpagol
│ ✧ maria pik dew✧ khabo✧ bara
╰───────────────◊
╭─『 RX  CHAT BOT 』
╰‣ Total commands: ${totalCmds}
╰‣ A Facebook Bot
╰‣ CEO : Maria 🧃🐣
╰‣ ADMIN: rX Abdullah
╰‣ If you don't know how to use commands,
   Then Type: !help [commandName]
`;

  return api.sendMessage(message, threadID, messageID);
};
