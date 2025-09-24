const os = require("os");

const startTime = new Date();

module.exports = {
  config: {
    name: "up",
    version: "2.2.0",
    hasPermssion: 0,
    credits: "⚡ Updated with ADK by RX",
    description: "Digital-style uptime + system info + ADK with progress bars",
    commandCategory: "box",
    usages: "uptime3",
    prefix: false,
    dependencies: {},
    cooldowns: 5,
  },

  run: async function({ api, event }) {
  try {
    // First message send
    let msg = await api.sendMessage("⏳ Gathering system info...", event.threadID);

    // Progress steps
    const progressSteps = [
      { label: "[█░░░░░░░░] 10%", delay: 500 },
      { label: "[███░░░░░░] 30%", delay: 500 },
      { label: "[█████░░░░] 50%", delay: 500 },
      { label: "[███████░░] 70%", delay: 500 },
      { label: "[█████████] 100%", delay: 500 }
    ];

    // Loop progress
    for (const step of progressSteps) {
      await new Promise(res => setTimeout(res, step.delay));
      await api.editMessage(step.label, msg.messageID);
    }

    // Final message after complete
    await new Promise(res => setTimeout(res, 500));
    await api.editMessage("✅ System Info Loaded!", msg.messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Failed to load system info.", event.threadID);
  }

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
      const time = now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: true });

      // System Info
      const totalMemory = os.totalmem() / (1024 ** 3);
      const freeMemory = os.freemem() / (1024 ** 3);
      const usedMemory = totalMemory - freeMemory;
      const cpuModel = os.cpus()[0].model;
      const cpuUsage =
        os.cpus().map(cpu => cpu.times.user).reduce((acc, curr) => acc + curr) / os.cpus().length;
      const loadAvg = os.loadavg().map(n => n.toFixed(2)).join(", ");
      const osUptimeSec = os.uptime();
      const osUptime = `${Math.floor(osUptimeSec / 3600)}h ${Math.floor((osUptimeSec % 3600) / 60)}m`;
      const totalCores = os.cpus().length;
      const hostname = os.hostname();
      const internalId = "RX-CHATBOT-6931";
      const botVersion = "v2.0.0-rx-stable";

      // Final message with full digital style ───×
      const info = `
╭───× 𝐒𝐞𝐫𝐯𝐞𝐫 𝐢𝐧𝐟𝐨 ×───╮
│ ᰔ𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭
│ ───×
│ ⏳ RUNTIME INFO
│ ───×
│ UPTIME     : ${uptimeFormatted}
│ DATE       : ${date}
│ TIME       : ${time}
│ ───×
│ 🖥️ SYSTEM INFO
│ OS         : ${os.type()} ${os.arch()}
│ LANG VER   : ${process.version}
│ CPU MODEL  : ${cpuModel}
│ CPU USAGE  : ${cpuUsage.toFixed(1)}%
│ RAM USAGE  : ${usedMemory.toFixed(2)} GB / ${totalMemory.toFixed(2)} GB
│ ───×
│ 🧠 ADVANCED DEVICE KNOWLEDGE (ADK)
│ HOSTNAME    : 𝐡𝐢𝐝𝐞 𝐛𝐲 𝐫𝐗
│ LOAD AVG    : ${loadAvg}
│ TOTAL CORES : ${totalCores}
│ OS UPTIME   : ${osUptime}
│ INTERNAL ID : ${internalId}
│ BOT VERSION : ${botVersion}
╰─────────────⧕
      `;

      api.sendMessage(info, event.threadID);
    } catch (error) {
      console.error("❌ Error in uptime3:", error);
      api.sendMessage("❌ Failed to get uptime info.", event.threadID);
    }
  },
};
