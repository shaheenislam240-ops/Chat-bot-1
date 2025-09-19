const os = require('os');
const startTime = new Date();

module.exports = {
  config: {
    name: "time",
    version: "1.0",
    hasPermssion: 0,
    credits: "SUJON",
    description: "Show system info including CPU, RAM, storage, uptime, date, and time with progress animation.",
    commandCategory: "system",
    usages: "sysinfo",
    prefix: false,
    cooldowns: 5
  },

  run: async function({ api, event }) {
    try {
      // Initial message
      let msg = await api.sendMessage("⏳ Gathering system info...", event.threadID);

      // Simulate animated progress bars
      const progressSteps = [
        { label: "[█░░░░░░░░] 10%", delay: 500 },
        { label: "[███░░░░░░] 30%", delay: 500 },
        { label: "[█████░░░░] 50%", delay: 500 },
        { label: "[███████░░] 70%", delay: 500 },
        { label: "[█████████] 100%", delay: 500 }
      ];

      for (const step of progressSteps) {
        await new Promise(res => setTimeout(res, step.delay));
        try {
          const edited = await api.editMessage(step.label, msg.messageID);
          msg.messageID = edited.messageID; // update messageID for next edit
        } catch {
          msg = await api.sendMessage(step.label, event.threadID);
        }
      }

      // Uptime calculations
      const now = new Date();
      const uptimeSeconds = Math.floor((now - startTime) / 1000);
      const days = Math.floor(uptimeSeconds / (3600*24));
      const hours = Math.floor((uptimeSeconds % (3600*24)) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = uptimeSeconds % 60;
      const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // CPU info
      const cpuLoad = os.loadavg()[0].toFixed(2);
      const cpuCount = os.cpus().length;

      // RAM info
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // GB
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);   // GB
      const usedMem = (totalMem - freeMem).toFixed(2);

      // OS info
      const osName = `${os.type()} ${os.arch()}`;
      const platform = os.platform();

      // Time info
      const localeDate = now.toLocaleDateString("en-US");
      const localeTime = now.toLocaleTimeString("en-US", { timeZone: "Asia/Dhaka", hour12: true });

      // Final system info message
      const finalMessage = `
📊 SYSTEM INFO
─────────────
OS: ${osName} (${platform})
CPU: ${cpuCount} cores, Load: ${cpuLoad}
RAM: ${usedMem}GB / ${totalMem}GB
Uptime: ${uptimeStr}
Date: ${localeDate}
Time: ${localeTime}
      `;

      // Send final info
      await api.editMessage(finalMessage, msg.messageID);

    } catch (err) {
      console.error("Error fetching system info:", err);
      api.sendMessage("❌ Failed to get system info.", event.threadID);
    }
  }
};
