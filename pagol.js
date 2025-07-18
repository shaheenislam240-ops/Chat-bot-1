module.exports.config = {
    name: "pagol",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Modified by rX Abdullah",
    description: "Pagol text & image bonding",
    commandCategory: "Bonding",
    usages: "[tag]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "path": "",
        "axios": ""
    }
};

module.exports.run = async function ({ event, api }) {
    const fs = global.nodemodule["fs-extra"];
    const axios = global.nodemodule["axios"];
    const { threadID, messageID, mentions } = event;
    const mention = Object.keys(mentions);
    if (!mention[0]) return api.sendMessage("একজনকে ট্যাগ কর পাগল বানানোর জন্য 🤪", threadID, messageID);

    const name = mentions[mention[0]].replace("@", "");
    const text = `@${name} আপনার মাথার কি তার ছিঁড়ে গেছে 🧠💥\n\nআর আপনি পাবনায় যেতে চান না? তাহলে নিচের ছবি দেখুন!`;

    const imageURL = "https://i.postimg.cc/fT36yJPT/att-b-Cx-CXv-M6-Mj7-PKDm8-WBu-Y01lehf7gmnx-Jmzog-JJ9b-Ug.jpg";
    const imagePath = __dirname + "/cache/pagol.jpg";
    const imgData = (await axios.get(imageURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(imagePath, Buffer.from(imgData, "utf-8"));

    return api.sendMessage({
        body: text,
        attachment: fs.createReadStream(imagePath),
        mentions: [{ id: mention[0], tag: `@${name}` }]
    }, threadID, () => fs.unlinkSync(imagePath), messageID);
};
