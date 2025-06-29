const axios = require("axios");

module.exports.config = {
  name: "chatgpt",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "rxAbdullah",
  description: "Smart GPT that replies to anyone's reply",
  usePrefix: false,
  commandCategory: "ai",
  cooldowns: 2
};

const apiKey = "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";

// ✅ Step 1: Trigger message = "gpt"
module.exports.handleEvent = async function ({ api, event }) {
  const body = event.body?.toLowerCase() || "";

  if (body === "gpt" && !event.messageReply) {
    return api.sendMessage("🤖 GPT: আমাকে কী বলবে? reply দিয়ে বলো।", event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        history: []
      });
    }, event.messageID);
  }

  // If someone replies to a message containing "🤖 GPT:"
  if (event.messageReply && event.messageReply.body?.toLowerCase().includes("🤖 gpt")) {
    const userInput = body;

    try {
      const res = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userInput }]
      }, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      const reply = res.data.choices[0].message.content;

      api.sendMessage(`🤖 ${reply}`, event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          history: [
            { role: "user", content: userInput },
            { role: "assistant", content: reply }
          ]
        });
      }, event.messageID);

    } catch (err) {
      return api.sendMessage("❌ GPT error: " + err.message, event.threadID, event.messageID);
    }
  }
};

// ✅ Step 2: handleReply works for ANY user
module.exports.handleReply = async function ({ api, event, handleReply }) {
  const userInput = event.body;

  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        ...handleReply.history,
        { role: "user", content: userInput }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const reply = res.data.choices[0].message.content;

    api.sendMessage(`🤖 ${reply}`, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        history: [
          ...handleReply.history,
          { role: "user", content: userInput },
          { role: "assistant", content: reply }
        ]
      });
    }, event.messageID);

  } catch (err) {
    return api.sendMessage("❌ GPT error: " + err.message, event.threadID, event.messageID);
  }
};
