const Discord = require('discord.js');
exports.run = (client, msg, args, lang) => {
	const input = args.slice();

	if (!input || input.length === 0) return msg.reply(lang.embed_error);
	if (input.join(' ').length > 1000) return msg.reply(lang.embed_toobig);

	const embedinput = input.join(' ').replace('//', '\n');
	const embed = new Discord.RichEmbed()
		.setDescription(embedinput)
		.setColor('RANDOM');

	msg.channel.send({
		embed
	});
};