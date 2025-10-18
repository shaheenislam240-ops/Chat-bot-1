module.exports.config = {
 name: "qr",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "rX",
 description: "Generate QR code from text",
 commandCategory: "user",
 usages: "[text]",
 cooldowns: 5,
 dependencies: {
 "qrcode": "",
 "fs-extra": ""
 }
};

module.exports.languages = {
 "vi": {
 "missingInput": "Hãy nhập đầu vào để có thể tạo qr code"
 },
 "en": {
 "missingInput": "Enter input to create qr code"
 }
};

module.exports.run = async function({ api, event, args, getText }) {
 const { toFile, toBuffer } = global.nodemodule["qrcode"];
 const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
 const text = args.join(" ");

 if (!text) return api.sendMessage(getText("missingInput"), event.threadID, event.messageID);

 try {
 const filePath = __dirname + "/cache/qr.png";

 // QR code options
 const options = {
 errorCorrectionLevel: 'H',
 type: 'image/png',
 quality: 0.3,
 scale: 10,
 margin: 1,
 color: { dark: '#000000', light: '#ffffff' }
 };

 // Generate QR code and save to file
 await toFile(filePath, text, options);

 // Send QR code image
 api.sendMessage({
 body: "✅ Here's your QR code:",
 attachment: createReadStream(filePath)
 }, event.threadID, () => unlinkSync(filePath), event.messageID);

 } catch (err) {
 console.error(err);
 api.sendMessage("⚠️ Error generating QR code!", event.threadID, event.messageID);
 }
};
