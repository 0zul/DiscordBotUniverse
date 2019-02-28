exports.run = async (client, message, args) => {
  
    let members = message.guild.members.filter(m => m.user.discriminator === args[0]).map(m => m.user.tag);
    let total = members.length;
    members = members.length > 0 ? members.slice(0, 10).join('\n') : 'None';
  
    await message.channel.send({
      embed: {
        color: 63884,
        title: 'Discriminator search',
        description: `Found **${total}** users with discriminator **${args[0]}**`,
        fields: [
          {
            name: 'Users',
            value: total > 10 ? `${members} and ${total - 10} more.` : members
          }
        ]
      }
    });
  };