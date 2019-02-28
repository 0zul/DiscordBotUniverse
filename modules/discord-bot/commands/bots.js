const settings = require(`${process.cwd()}/settings.json`);

exports.run = async (client, message, args, r) => {

    if (!args[0]) {
        let bots = await r.table('bots').run()
        bots = bots.filter(bot => (message.author.id == bot.owner) || bot.owners.includes(message.author.id));
            if (bots.length == 0) {
                return message.channel.send({
                    embed: {
                        color: 13632027,
                        description: "\:x: You don't have any bots!"
                    }
                })
            } else {
                let desc = bots.map((bot) => { 
                    if (bot.verified == true) {
                        return '<@' + bot.id + '> <a:' + settings.emojis.verified + '>'
                    } else if (bot.website_bot == true) {
                        return '<@' + bot.id + '> <:' + settings.emojis.website_bot + '>'
                    } else {
                        return '<@' + bot.id +'>'
                    }
                }).join('\n')
                                    
                message.channel.send({
                    embed: {
                        title: message.author.tag + "'s bots",
                        color: 8847104,
                        description: desc
                    }
                })
            }
    } else {
        let developer = client.users.get(args[0]) || message.mentions.members.first();
        if (!developer) return message.channel.send({
            embed: {
                color: 13632027,
                description: "\:x: I can't find that user."
            }
        })

        let bots = await r.table('bots').run()
            bots = bots.filter(bot => (developer.id == bot.owner) || bot.owners.includes(developer.id));
            if (bots.length == 0) {
                return message.channel.send({
                    embed: {
                        color: 13632027,
                        description: "\:x: That user doesn't have any bots!"
                    }
                })
            } else {
            let desc = bots.map((bot) => { 
                if (bot.verified == true) {
                    return '<@' + bot.id + '> <a:' + settings.emojis.verified + '>'
                } else if (bot.website_bot == true) {
                    return '<@' + bot.id + '> <:' + settings.emojis.website_bot + '>'
                } else {
                    return '<@' + bot.id +'>'
                }
                }).join('\n')
                                
            message.channel.send({
                embed: {
                    title: client.users.get(developer.id).tag + "'s bots",
                    color: 8847104,
                    description: desc
                }
            })
        }
    }

};