module.exports.config = {
  name: "help",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "CYBER ☢️_𖣘 -BOT ⚠️ TEAM + Modified by rX Abdullah",
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

  const message = `✨ [ Guide For Beginners - Page 1 ] ✨

╭──── [ 𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥 ]
│ ✧ dalle✧ aimirror✧ dalle3
│ ✧ emi✧ faceswap✧ flux
│ ✧ hidream✧ fluxpro✧ genix
│ ✧ ghibli✧ infinity✧ meta
│ ✧ midjourney✧ midjourney2✧ monster
│ ✧ nigi✧ nigiv2✧ pixart
│ ✧ real✧ xl31
╰───────────────◊
╭──── [ 𝗖𝗛𝗔𝗧 𝗔𝗜 ]
│ ✧ gpt✧ babyai✧ baby
│ ✧ bbz✧ bf✧ blackbox
│ ✧ bot✧ claude✧ claude2
│ ✧ deepseek✧ gemini✧ gemini2
│ ✧ gf✧ gf2✧ gpt1
│ ✧ gpt3✧ gpt4✧ gpt5
│ ✧ grok✧ llama✧ palm
│ ✧ pi
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
╭──── [ GAME ]
│ ✧ actor✧ coinflip✧ daily
│ ✧ dhbc✧ freefire✧ fight
│ ✧ flag✧ guessnumber✧ lastchar
│ ✧ numbergame✧ pokemon✧ quiz
│ ✧ slot✧ waifu✧ wordgame
╰───────────────◊
╭──── [ BOX CHAT ]
│ ✧ onlyadminbox✧ admin✧ antichangeinfobox
│ ✧ autosetname✧ badwords✧ ban
│ ✧ groupinfo✧ count✧ filteruser
│ ✧ kick✧ refresh✧ rules
│ ✧ sendnoti✧ setname✧ warn
╰───────────────◊
╭──── [ SYSTEM ]
│ ✧ adduser✧ all✧ ckban
│ ✧ delete✧ fakechat✧ help
│ ✧ out✧ restart✧ rr
│ ✧ shell✧ spam✧ vip
╰───────────────◊
╭──── [ MEME ]
│ ✧ ads✧ buttslap✧ dcdig
│ ✧ gname✧ putin✧ wanted2
╰───────────────◊
╭──── [ MEDIA ]
│ ✧ album✧ emojis✧ girl
│ ✧ github✧ hitler✧ imgur
│ ✧ manga✧ mobile✧ pinterest
│ ✧ profile✧ rmbg✧ salami
│ ✧ sing✧ text2video✧ tts
│ ✧ upscale✧ video✧ ytb
│ ✧ ytt
╰───────────────◊
╭──── [ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 ]
│ ✧ alldl✧ autodl✧ download
│ ✧ tiksr✧ tiktokid
╰───────────────◊
╭──── [ ANIME ]
│ ✧ anilist✧ animeinfo✧ aninews
│ ✧ anivid✧ waifu2
╰───────────────◊

╭─『 RX  BOT 』
╰‣ Total commands: ${totalCmds}
╰‣ Page 1 of 6
╰‣ A Personal Facebook Bot
╰‣ ADMIN: rX Abdullah
╰‣ If you don't know how to use commands,
   Then Type: !help [commandName]
`;

  return api.sendMessage(message, threadID, messageID);
};
