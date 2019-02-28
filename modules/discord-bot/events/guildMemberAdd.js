const r = require('../../database');
const settings = require('../../../settings.json');

module.exports = async (client, member) => {

    if (member.user.bot) {
        let bot = await r.table('bots').get(member.id).run()
        if (!bot) return;   
        try {
            await member.roles.add(settings.roles.bot);
        } catch(e) {
            console.log("Failed to add role to bot.")
        }

        if (bot.verified) {
            try {
                await member.roles.add(settings.roles.verified_bot);
            } catch(e) {
                console.log("Failed to add role to bot.")
            }
        }
    } else {
        let bots = await r.table('bots').run()
        bots = bots.filter(bot => (member.id == bot.owner) || bot.owners.includes(member.id));
        if (bots.length == 0) return;   
        try {
            await member.roles.add(settings.roles.bot_developer);
        } catch(e) {
            console.log("Failed to add role to user.")
        }

        const user = await r.table('users').get(member.id).run();
        if (!user) return;

        if (user.isVerifiedDev) {
            try {
                await member.roles.add(settings.roles.verified_developer);
            } catch(e) {
                console.log("Failed to add role to user.")
            } 
        }

        
    }
    
};
  