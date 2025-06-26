module.exports.config = {
  name: "AutoTime",
  version: "2.0",
  hasPermssion: 0,
  credits: "CYBER ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Islamick Chat - Auto Azan Time Checker (Silent Mode)",
  commandCategory: "Islamick Chat",
  countDown: 3
};

module.exports.run = async ({ api }) => {
  const azanTimes = {
    "05:35 AM": {
      message: "»✨ফজরের আজান হয়েছে সকাল ৫:৩৫ এ!",
      url: "https://drive.google.com/uc?id=1m5jiP4q9IpA1wH-eSrGRc2P9joj2kby&export=download"
    },
    "01:00 PM": {
      message: "»✨জোহরের আজান হয়েছে দুপুর ১:০০ টায়!",
      url: "https://drive.google.com/uc?id=1mB8EpEEbSpTIQSpw0qVKZo6iI7GJwuMpb&export=download"
    },
    "04:30 PM": {
      message: "»✨আসরের আজান হয়েছে বিকেল ৪:৩০ এ!",
      url: "https://drive.google.com/uc?id=1mkNnhFFvNTbse57h2SG2ayqAlkvtqaxH&export=download"
    },
    "07:05 PM": {
      message: "»✨মাগরিবের আজান হয়েছে সন্ধ্যা ৭:০৫ এ!",
      url: "https://drive.google.com/uc?id=1mP2HJlKRpgmCwuTazzFPqDbIX4Bo64EQ&export=download"
    },
    "08:15 PM": {
      message: "»✨ইশার আজান হয়েছে রাত ৮:১৫ এ!",
      url: "https://drive.google.com/uc?id=1mNVwfsTEwuMpb1MMj7G2ayqAlkvtqaxH&export=download"
    }
  };

  const checkAzanTime = async () => {
    const currentTime = new Date(Date.now() + 6 * 60 * 60 * 1000)
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).trim();

    if (azanTimes[currentTime]) {
    }

    setTimeout(checkAzanTime, 60 * 1000);
  };

  checkAzanTime();
};

module.exports.onLoad = () => {};
