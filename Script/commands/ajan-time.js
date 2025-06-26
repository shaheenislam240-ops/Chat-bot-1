module.exports.config = {
  name: "AutoTime",
  version: "2.0",
  hasPermssion: 0,
  credits: "CYBER ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Islamick Chat - Auto Azan Reminders",
  commandCategory: "Islamick Chat",
  countDown: 3
};

module.exports.run = async ({ api }) => {
  const axios = require("axios");

  const azanTimes = {
    "05:35 AM": {
      message: "»✨ফজরের আজান হয়েছে সকাল ৫:৩৫ এ! সবাই নামাজের প্রস্তুতি নিন।",
      url: "https://drive.google.com/uc?id=1m5jiP4q9IpA1wH-eSrGRc2P9joj2kby&export=download"
    },
    "01:00 PM": {
      message: "»✨জোহরের আজান হয়েছে দুপুর ১:০০ টায়! সবাই প্রস্তুত হন নামাজের জন্য।",
      url: "https://drive.google.com/uc?id=1mB8EpEEbSpTIQSpw0qVKZo6iI7GJwuMpb&export=download"
    },
    "04:30 PM": {
      message: "»✨আসরের আজান হয়েছে বিকেল ৪:৩০ এ! প্রিয় মুসলিম ভাই ও বন, নামাজ পড়ুন।",
      url: "https://drive.google.com/uc?id=1mkNnhFFvNTbse57h2SG2ayqAlkvtqaxH&export=download"
    },
    "07:05 PM": {
      message: "»✨মাগরিবের আজান হয়েছে সন্ধ্যা ৭:০৫ এ! সবাই নামাজে যোগ দিন।",
      url: "https://drive.google.com/uc?id=1mP2HJlKRpgmCwuTazzFPqDbIX4Bo64EQ&export=download"
    },
    "08:15 PM": {
      message: "»✨ইশার আজান হয়েছে রাত ৮:১৫ এ! সবাই নামাজের প্রস্তুতি নিন।",
      url: "https://drive.google.com/uc?id=1mNVwfsTEwuMpb1MMj7G2ayqAlkvtqaxH&export=download"
    }
  };

  const checkAzanTime = async () => {
    const currentTime = new Date(Date.now() + 6 * 60 * 60 * 1000) // GMT+6 for BD
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).trim();

    if (azanTimes[currentTime]) {
      const azan = azanTimes[currentTime];

      // ✅ লগ দেখাবে কিন্তু কিছু পাঠাবে না
      console.log(`⏰ ${currentTime} - আজানের সময় হয়েছে (মেসেজ পাঠানো বন্ধ আছে)`);
    }

    // প্রতি ১ মিনিট পরপর আবার চেক করবে
    setTimeout(checkAzanTime, 60 * 1000);
  };

  checkAzanTime();
};

module.exports.onLoad = () => { };
