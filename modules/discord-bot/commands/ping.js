const Discord = require("discord.js");
const client = new Discord.Client();
const { ListEmbed } = require(`${process.cwd()}/modules/discord-bot/utils/MessageEmbed`);
exports.run = (client, message) => {
    const description = `Latency: ${client.ping}ms`;
    message.channel.send({ embed: ListEmbed(description)});
};