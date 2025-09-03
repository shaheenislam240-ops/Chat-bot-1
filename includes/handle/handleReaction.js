module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        const { handleReaction, commands } = global.client;
        const { messageID, threadID, userID } = event;

        if (!handleReaction || handleReaction.length === 0) return;

        const indexOfHandle = handleReaction.findIndex(e => e.messageID == messageID);
        if (indexOfHandle < 0) return;

        const indexOfMessage = handleReaction[indexOfHandle];
        const handleNeedExec = commands.get(indexOfMessage.name);

        if (!handleNeedExec) return api.sendMessage(global.getText('handleReaction', 'missingValue'), threadID, messageID);

        try {
            var getText2;
            if (handleNeedExec.languages && typeof handleNeedExec.languages === 'object') {
                getText2 = (...value) => {
                    const react = handleNeedExec.languages || {};
                    if (!react.hasOwnProperty(global.config.language))
                        return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID);
                    var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
                    for (var i = value.length; i > 0; i--) {
                        const expReg = RegExp('%' + i, 'g');
                        lang = lang.replace(expReg, value[i]);
                    }
                    return lang;
                };
            } else getText2 = () => {};

            // Prepare object for handleReaction
            const Obj = {
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReaction: indexOfMessage,
                getText: getText2
            };

            // Execute module's handleReaction
            handleNeedExec.handleReaction(Obj);

            // ✅ Auto unsent reaction: যদি author নিজে reaction দেয়
            if (userID === indexOfMessage.author) {
                api.unsendMessage(messageID); // original message remove
            }

            // Remove handle after execute
            global.client.handleReaction.splice(indexOfHandle, 1);

            return;
        } catch (error) {
            return api.sendMessage(global.getText('handleReaction', 'executeError', error), threadID, messageID);
        }
    };
};
