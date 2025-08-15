const axios = require("axios");
const { getStreamFromURL, drive } = global.utils;

module.exports = {
    name: "futurebot",
    alias: ["chatgpt", "rip4k", "upscale"],
    desc: "Text Chat + Photo/Video future-proof system",
    type: "ai",
    cooldown: 3,

    async exec({ event, api, args }) {
        const { threadID, messageReply, attachments, body } = event;

        // ---------- 1️⃣ Photo/Video Reply System ----------
        if (body?.startsWith("!rip4k")) {
            let files = [];
            if (messageReply && messageReply.attachments.length > 0) files = messageReply.attachments;
            else if (attachments.length > 0) files = attachments;

            if (files.length === 0) return api.sendMessage("⚠️ Reply to photo/video to process!", threadID);

            let uploadedFiles = [];

            for (const file of files) {
                try {
                    if (!["photo", "png", "video", "audio"].includes(file.type)) continue;

                    const stream = await getStreamFromURL(file.url);
                    const ext = file.filename?.split(".").pop() || "png";
                    const fileName = `future_${Date.now()}.${ext}`;
                    const infoFile = await drive.uploadFile(fileName, stream);

                    uploadedFiles.push(infoFile.id);
                } catch (err) {
                    console.error(err);
                }
            }

            if (uploadedFiles.length === 0) 
                return api.sendMessage("⚠️ No valid photo/video to process!", threadID);

            return api.sendMessage(`✅ Successfully processed ${uploadedFiles.length} file(s)!\nFile IDs: ${uploadedFiles.join(", ")}`, threadID);
        }

        // ---------- 2️⃣ Text Chat System ----------
        else if (body?.startsWith("!chat")) {
            const prompt = args.join(" ");
            if (!prompt) return api.sendMessage("⚠️ Please type something to chat!", threadID);

            try {
                const res = await axios.post(
                    "https://api.openai.com/v1/chat/completions",
                    {
                        model: "gpt-4o-mini",
                        messages: [{ role: "user", content: prompt }]
                    },
                    {
                        headers: {
                            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const reply = res.data.choices[0].message.content;
                return api.sendMessage(reply, threadID);

            } catch (err) {
                console.error(err);
                return api.sendMessage("⚠️ Something went wrong with ChatGPT API 😓", threadID);
            }
        }

        // ---------- 3️⃣ Invalid Command ----------
        else {
            return api.sendMessage("⚠️ Use !chat <text> for text or reply !rip4k to photo/video", threadID);
        }
    }
};
