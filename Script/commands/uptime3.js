const os = require("os");
const fs = require("fs-extra");

const startTime = new Date(); // Bot start time

module.exports = {
  config: {
    name: "time",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 ⚡ Updated with ADK by RX",
    description: "Show uptime + system info + ADK style stats",
    commandCategory: "box",
    usages: "uptime3",
    prefix: false,
    dependencies: {},
    cooldowns: 5,
  },

  run: async function ({ api, event }) {
    try {
      // Format uptime
      const uptimeInSeconds = (new Date() - startTime) / 1000;
      const days = Math.floor(uptimeInSeconds / (3600 * 24));
      const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const secondsLeft = Math.floor(uptimeInSeconds % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      // Date & Time
      const now = new Date();
      const date = now.toLocaleDateString("en-US");
      const time = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      });

      // System Info
      const totalMemory = os.totalmem() / (1024 ** 3);
      const freeMemory = os.freemem() / (1024 ** 3);
      const usedMemory = totalMemory - freeMemory;

      const cpuModel = os.cpus()[0].model;
      const cpuUsage =
        os.cpus()
          .map(cpu => cpu.times.user)
          .reduce((acc, curr) => acc + curr) / os.cpus().length;

      const loadAvg = os.loadavg().map(n => n.toFixed(2)).join(", ");
      const osUptimeSec = os.uptime();
      const osUptime = `${Math.floor(osUptimeSec / 3600)}h ${Math.floor((osUptimeSec % 3600) / 60)}m`;

      const totalCores = os.cpus().length;
      const hostname = os.hostname();

      const internalId = "RX-CHATBOT-6931";
      const botVersion = "v1.4.7-rx-stable";

      // Ping Test
      const timeStart = Date.now();
      await api.sendMessage("🔎 Checking system...", event.threadID);
      const ping = Date.now() - timeStart;
      const pingStatus = ping < 1000 ? "✅ Smooth System" : "⛔ Bad System";

      // Final message
      const info = `♡   ∩_∩
（„• ֊ •„)♡
╭─∪∪────────────⟡
│ 🎀 Rx Chat Bot
├───────────────⟡

│ ⏳ RUNTIME INFO
│ ┗⟡ UPTIME     : ${uptimeFormatted}
│ ┗⟡ DATE       : ${date}
│ ┗⟡ TIME       : ${time}

├───────────────⟡
│ 🖥️ SYSTEM INFO
│ ┗⟡ OS         : ${os.type()} ${os.arch()}
│ ┗⟡ LANG VER   : ${process.version}
│ ┗⟡ CPU MODEL  : ${cpuModel}
│ ┗⟡ CPU USAGE  : ${cpuUsage.toFixed(1)}%
│ ┗⟡ RAM USAGE  : ${usedMemory.toFixed(2)} GB / ${totalMemory.toFixed(2)} GB

├───────────────⟡
│ 🧠 ADVANCED DEVICE KNOWLEDGE (ADK)
│ ┗⟡ HOSTNAME    : ${hostname}
│ ┗⟡ LOAD AVG    : ${loadAvg}
│ ┗⟡ TOTAL CORES : ${totalCores}
│ ┗⟡ OS UPTIME   : ${osUptime}
│ ┗⟡ INTERNAL ID : ${internalId}
│ ┗⟡ BOT VERSION : ${botVersion}

├───────────────⟡
│ 🌐 NETWORK STATUS
│ ┗⟡ PING        : ${ping}ms
│ ┗⟡ STATUS      : ${pingStatus}

╰───────────────⟡`;

      api.sendMessage(info, event.threadID);
    } catch (error) {
      console.error("❌ Error in uptime3:", error);
      api.sendMessage("❌ Failed to get uptime info.", event.threadID);
    }
  },
};
