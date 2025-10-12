const path = require("path");
const { mkdirSync, writeFileSync, existsSync, createReadStream, readdirSync } = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "banchim",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "D-Jukie",
    description: "A game similar to shooting birds",
    commandCategory: "Game",
    usages: "[]",
    cooldowns: 0
};

module.exports.onLoad = async () => {
    const dir = __dirname + `/game/banchim/datauser/`;
    const _dir = __dirname + `/game/banchim/datauser/`;
    const __dir = __dirname + `/game/banchim/cache/`;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(_dir)) mkdirSync(_dir, { recursive: true });
    if (!existsSync(__dir)) mkdirSync(__dir, { recursive: true });
    return;
}

module.exports.checkPath = function (type, senderID) {
    const pathGame = path.join(__dirname, 'game','banchim', 'datauser', `${senderID}.json`);
    const pathGame_1 = require("./game/banchim/datauser/" + senderID + '.json');
    if (type == 1) return pathGame;
    if (type == 2) return pathGame_1;
}

module.exports.image = async function(link) {
    var images = [];
    let download = (await axios.get(link, { responseType: "arraybuffer" } )).data; 
    writeFileSync( __dirname + `/game/banchim/cache/banchim.png`, Buffer.from(download, "utf-8"));
    images.push(createReadStream(__dirname + `/game/banchim/cache/banchim.png`));
    return images;
}

module.exports.run = async function ({ api, event, args, client, Threads, __GLOBAL, Users, Currencies, getText }) {
    const { senderID, messageID, threadID } = event;
    const axios = require('axios');
    const fs = require('fs-extra');
    const pathData = path.join(__dirname, 'game', 'banchim', 'datauser', `${senderID}.json`);

    switch (args[0]) {
        case 'register':
        case '-r': {
            const nDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
            if (!existsSync(pathData)) {
                var obj = {};
                obj.name = (await Users.getData(senderID)).name;
                obj.ID = senderID;
                obj.shield = 3;
                obj.coins = 20000;
                obj.Island = {};
                obj.Island.level = 1;
                obj.Island.coinsLV = 200;
                obj.Island.data = { tower: 0, tree: 0, pool: 0, pet: 0 };
                obj.spin = 20;
                obj.timeRegister = nDate;
                writeFileSync(pathData, JSON.stringify(obj, null, 4));
                return api.sendMessage("⚔️ Registration successful!", threadID, messageID);
            } else return api.sendMessage("⚔️ You are already registered in the database ⚔️", threadID, messageID);
        }

        case 'spin': {
            if (!existsSync(pathData)) {
                return api.sendMessage({ body: `You haven't registered yet!`, attachment: await this.image('https://i.imgur.com/dwVYAXv.gif') }, threadID, messageID);
            }
            if(this.checkPath(2, senderID).spin == 0) return api.sendMessage('You have no spins left. Please buy more or wait 5 minutes for the system to give you 5 spins.', threadID, messageID);
            
            this.checkPath(2, senderID).spin -= 1;
            writeFileSync(this.checkPath(1, senderID), JSON.stringify(this.checkPath(2, senderID), null, 4));

            var items = [
                `${this.checkPath(2, senderID).Island.level * 1000} coins`,
                `${this.checkPath(2, senderID).Island.level * 3000} coins`,
                `${this.checkPath(2, senderID).Island.level * 5000} coins`,
                'Fake belt',
                'Gun',
                'Upgraded bullets',
                '1 spin',
                '2 spins',
                '5 spins'
            ];
            var getItem = items[Math.floor(Math.random() * items.length)];
            var i = this.getSpin(items, getItem, senderID);

            api.sendMessage({ body: `Congratulations! You got: ${getItem}`, attachment: await this.image('https://i.imgur.com/nVLZf17.gif') }, threadID, messageID);

            await new Promise(resolve => setTimeout(resolve, 1000));
            const data = readdirSync(__dirname + `/game/banchim/datauser`);

            if(i == 3) {
                if(data.length < 4) return api.sendMessage(`At least 3 players are needed on the server to steal birds.`, threadID, messageID);
                const others = data.filter(file => file != `${senderID}.json`).map(file => require(`./game/banchim/datauser/${file}`));
                others.sort((a, b) => a.coins - b.coins);
                var msg = `Highest coins: ${others[0].coins / 2}\n`;
                const randomIndex = others.sort(() => 0.5 - Math.random());
                for(var i = 0; i < 3; i ++) {
                    msg += `${i+1}. ${randomIndex[i].name} - Birdcage level ${randomIndex[i].Island.level}\n`;
                }
                msg += 'Please reply with the player you want to steal from!';
                return api.sendMessage(`==========\n${msg}`, threadID, (error, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "steal",
                        dem: others,
                        randomIndex
                    });
                }, messageID);
            } 
            else if(i == 5) {
                if(data.length < 4) return api.sendMessage(`At least 3 players are needed on the server to attack birdcages.`, threadID, messageID);
                var msgf = `[====ATTACK====]\n`, number = 1, p = [];
                for (let i of data) { 
                    if(i != `${senderID}.json`) {
                        var o = require(`./game/banchim/datauser/${i}`);
                        p.push(o);
                        msgf += `${number++}. ${o.name} - Island level ${o.Island.level}\n`;
                    }
                }
                return api.sendMessage(msgf, threadID, (error, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        type: "attack",
                        p
                    });
                }, messageID);
            }
            break;
        }

        case 'build':
        case 'construct': {
            if (!existsSync(pathData)) {
                return api.sendMessage({body: "You haven't registered yet!", attachment: await this.image('https://i.imgur.com/ej311PB.jpg')}, threadID, messageID);
            }
            var a = require(`./game/banchim/datauser/${senderID}.json`);
            return api.sendMessage(`Where do you want to build in your birdcage?\n1. Cage Body - ${a.Island.coinsLV * (a.Island.data.tower + 1)} coins (${a.Island.data.tower}/50)\n2. Trees for birds - ${a.Island.coinsLV * (a.Island.data.tree + 1)} coins(${a.Island.data.tree}/50)\n3. Playground - ${a.Island.coinsLV * (a.Island.data.pool + 1)} coins (${a.Island.data.pool}/50)\n4. Food area - ${a.Island.coinsLV * (a.Island.data.pet + 1)} coins (${a.Island.data.pet}/50)\n==============`, threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "build"
                });
            }, messageID);
        }

        case 'shop': {
            if (!existsSync(pathData)) {
                return api.sendMessage({body: "You haven't registered yet!", attachment: await this.image('https://i.imgur.com/NKSF8hg.png')}, threadID, messageID);
            }
            return api.sendMessage({
                body: `── [ Birdshoot Shop ] ──  \n\n🐸List of guns you can buy\n[🔫1]. A47K\n[🐉2]. M4A\n[🦋3]. ASM10\n[🎀4]. LK24\n[🍁5]. Type 25\n[🛡6]. AK117\n[🧨7]. M16\n[🔪8]. BK57\n[🧬9]. ICR-1`,
                attachment: await this.image('https://i.imgur.com/NKSF8hg.png')
            }, threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "shop"
                });
            }, messageID);
        }

        case 'shoot': {
            if (!existsSync(pathData)) {
                return api.sendMessage({body: "You haven't registered yet!", attachment: await this.image('https://i.imgur.com/tNnZMY4.png')}, threadID, messageID);
            }
            return api.sendMessage({ 
                body: `── [ Birdshoot Attack ] ──\nChoose a target or method to attack the birds.`, 
                attachment: await this.image('https://i.imgur.com/tNnZMY4.png') 
            }, threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "shoot"
                });
            }, messageID);
        }

        default:
            return api.sendMessage(`⚔️ Birdshoot Game Commands ⚔️\n\nregister | -r : Register in the game\nspin : Spin for rewards\nbuild | construct : Build structures in your birdcage\nshop : Open shop\nshoot : Attack birds or other players\n`, threadID, messageID);
    }
}

// Utility function for spins
module.exports.getSpin = function(items, getItem, senderID) {
    // Assign a numeric outcome for certain items
    if(getItem.includes('Fake belt')) return 3; // trigger steal
    if(getItem.includes('Gun')) return 5;       // trigger attack
    return 1;                                   // normal reward
}

// Optional: handle replies for steal/build/shop/attack/shoot
module.exports.handleReply = async function({ api, event, handleReply, Users }) {
    const { senderID, body, messageID, threadID } = event;
    const fs = require('fs-extra');
    switch(handleReply.type) {
        case "build":
            var userData = require(`./game/banchim/datauser/${senderID}.json`);
            var choice = parseInt(body);
            if(choice < 1 || choice > 4) return api.sendMessage("Invalid choice!", threadID, messageID);
            let buildKeys = ["tower","tree","pool","pet"];
            let key = buildKeys[choice-1];
            let cost = userData.Island.coinsLV * (userData.Island.data[key] + 1);
            if(userData.coins < cost) return api.sendMessage("Not enough coins!", threadID, messageID);
            userData.coins -= cost;
            userData.Island.data[key] += 1;
            fs.writeFileSync(`./game/banchim/datauser/${senderID}.json`, JSON.stringify(userData, null, 4));
            return api.sendMessage(`✅ Built successfully! You spent ${cost} coins.`, threadID, messageID);

        case "shop":
            // Implement shop purchase logic if needed
            return api.sendMessage("🛒 Shop purchase feature coming soon!", threadID, messageID);

        case "steal":
            // Example steal logic
            let targetIndex = parseInt(body)-1;
            if(targetIndex < 0 || targetIndex >= handleReply.randomIndex.length) return api.sendMessage("Invalid target!", threadID, messageID);
            let target = handleReply.randomIndex[targetIndex];
            let stolenCoins = Math.floor(target.coins / 2);
            let userDataSteal = require(`./game/banchim/datauser/${senderID}.json`);
            userDataSteal.coins += stolenCoins;
            let targetData = require(`./game/banchim/datauser/${target.ID}.json`);
            targetData.coins -= stolenCoins;
            fs.writeFileSync(`./game/banchim/datauser/${senderID}.json`, JSON.stringify(userDataSteal, null, 4));
            fs.writeFileSync(`./game/banchim/datauser/${target.ID}.json`, JSON.stringify(targetData, null, 4));
            return api.sendMessage(`💰 Successfully stole ${stolenCoins} coins from ${target.name}!`, threadID, messageID);

        case "attack":
            // Example attack logic
            return api.sendMessage("⚔️ Attack feature coming soon!", threadID, messageID);

        case "shoot":
            // Example shooting logic
            return api.sendMessage("🔫 Shooting feature coming soon!", threadID, messageID);

        default:
            break;
    }
}
