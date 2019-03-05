exports.run = async (client, msg, args) => {
    if (!msg.member.permissions.has("MANAGE_GUILD")) return msg.reply("you cannot use this command!");
    let member = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
    if (!member) return msg.channel.send(`<:X_:551100730623262751> Couldn't find that user`)
    let rolle = args.slice(1).join(' ');
    if (!rolle) return msg.channel.send(`<:X_:551100730623262751> Please specifiy a role`);
    let gRole = msg.guild.roles.find(role => role.name === rolle) 
    if (!gRole) return msg.channel.send(`<:X_:551100730623262751> Couldn't find that role`);

    if (!member.roles.has(gRole.id)) return msg.channel.send(`<:X_:551100730623262751> That user doesn't have that role`);
    member.roles.remove(gRole.id, `remrole cmd used to remove ${gRole.name} from ${member.user.tag}`).then(() => {
        msg.channel.send(`<:Check:551100730946355200> Removed role **${gRole.name}** from <@${member.id}>. `)
    }).catch((e) => {
        msg.channel.send(`<:X_:551100730623262751> An unexpected error has occurred while removing the role from <@${member.id}>. The error has been logged.`);
        console.log(e);
    });
};