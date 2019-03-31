const r = require("../../database");
const settings = require("../../../settings.json");

module.exports = async (client, member) => {
  if (member.user.bot) {
    let bot = await r
      .table("bots")
      .get(member.id)
      .run();
    if (!bot) return;

    if (bot.verified) {
      try {
        await member.addRole(settings.roles.bot);
        await member.addRole(settings.roles.verified_bot);
      } catch (e) {
        console.log("Failed to add role to bot.");
      }
      try {
        await member.setNickname(`[${bot.prefix}] ${member.user.username}`);
      } catch (e) {
        console.log("Failed to set nickname for bot.");
      }
      if (member.guild.id === "557329412652138497") {
        try {
          await member.guild
            .createChannel(`${member.user.username}`, "text")
            .then(async x => {
              await x.setParent("557531235954458624");
              await x.overwritePermissions(member, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
                CREATE_INSTANT_INVITE: false,
                MANAGE_CHANNEL: false,
                MANAGE_PERMISSIONS: false,
                READ_MESSAGES: true,
                MANAGE_WEBHOOKS: false,
                SEND_TTS_MESSAGES: false,
                EMBED_LINKS: true,
                ATTACH_FILES: false,
                MENTION_EVERYONE: false,
                USE_EXTERNAL_EMOJIS: false
              });
              await x.overwritePermissions(member.guild.roles.get("557329412652138497"), {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false,
                READ_MESSAGE_HISTORY: false,
                READ_MESSAGES: false,
                CREATE_INSTANT_INVITE: false,
                MANAGE_CHANNEL: false,
                MANAGE_PERMISSIONS: false,
                MANAGE_WEBHOOKS: false,
                SEND_TTS_MESSAGES: false,
                EMBED_LINKS: false,
                ATTACH_FILES: false,
                MENTION_EVERYONE: false,
                USE_EXTERNAL_EMOJIS: false
              });
              await member.guild.channels.forEach(async g => {
                if (g.id === x.id) return;
                g.overwritePermissions(member, {
                  VIEW_CHANNEL: false,
                  SEND_MESSAGES: false,
                  READ_MESSAGE_HISTORY: false,
                  CREATE_INSTANT_INVITE: false,
                  MANAGE_CHANNEL: false,
                  MANAGE_PERMISSIONS: false,
                  MANAGE_WEBHOOKS: false,
                  READ_MESSAGES: false,
                  SEND_TTS_MESSAGES: false,
                  EMBED_LINKS: false,
                  ATTACH_FILES: false,
                  MENTION_EVERYONE: false,
                  USE_EXTERNAL_EMOJIS: false
                });
              });
            });
        } catch (e) {
          console.log("Failed to create channel and set parent in verification guild" + e.message);
        }
      }
    } else {
      //non verified bot
      try {
        await member.addRole(settings.roles.bot);
      } catch (e) {
        console.log("Failed to add role to bot.");
      }
      try {
        await member.setNickname(`[${bot.prefix}] ${member.user.username}`);
      } catch (e) {
        console.log("Failed to set nickname for bot.");
      }
      if (member.guild.id === "557329412652138497") {
        try {
          await member.guild
            .createChannel(`${member.user.username}`, "text")
            .then(async x => {
              await x.setParent("557531235954458624");
              await x.overwritePermissions(member, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
                CREATE_INSTANT_INVITE: false,
                MANAGE_CHANNEL: false,
                MANAGE_PERMISSIONS: false,
                READ_MESSAGES: true,
                MANAGE_WEBHOOKS: false,
                SEND_TTS_MESSAGES: false,
                EMBED_LINKS: true,
                ATTACH_FILES: false,
                MENTION_EVERYONE: false,
                USE_EXTERNAL_EMOJIS: false
              });
              await x.overwritePermissions(member.guild.roles.get("557329412652138497"), {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false,
                READ_MESSAGE_HISTORY: false,
                CREATE_INSTANT_INVITE: false,
                MANAGE_CHANNEL: false,
                MANAGE_PERMISSIONS: false,
                MANAGE_WEBHOOKS: false,
                SEND_TTS_MESSAGES: false,
                READ_MESSAGES: false,
                EMBED_LINKS: false,
                ATTACH_FILES: false,
                MENTION_EVERYONE: false,
                USE_EXTERNAL_EMOJIS: false
              });
              await member.guild.channels.forEach(async g => {
                if (g.id === x.id) return;
                g.overwritePermissions(member, {
                  VIEW_CHANNEL: false,
                  SEND_MESSAGES: false,
                  READ_MESSAGE_HISTORY: false,
                  CREATE_INSTANT_INVITE: false,
                  MANAGE_CHANNEL: false,
                  MANAGE_PERMISSIONS: false,
                  READ_MESSAGES: false,
                  MANAGE_WEBHOOKS: false,
                  SEND_TTS_MESSAGES: false,
                  EMBED_LINKS: false,
                  ATTACH_FILES: false,
                  MENTION_EVERYONE: false,
                  USE_EXTERNAL_EMOJIS: false
                });
              });
            });
        } catch (e) {
          console.log("Failed to create channel and set parent in verification guild" + e.message);
        }
      }
    }
  } else {
    let bots = await r.table("bots").run();
    bots = bots.filter(
      bot => member.id == bot.owner || bot.owners.includes(member.id)
    );
    if (bots.length == 0) return;
    try {
      await member.addRole(settings.roles.bot_developer);
    } catch (e) {
      console.log("Failed to add role to user.");
    }

    const user = await r
      .table("users")
      .get(member.id)
      .run();
    if (!user) return;

    if (user.isVerifiedDev) {
      try {
        await member.addRole(settings.roles.verified_developer);
      } catch (e) {
        console.log("Failed to add role to user.");
      }
    }

    //website admin
    if (user.isAdmin) {
      try {
        await member.addRole("547119352009195531");
      } catch (e) {
        console.log("Failed to add role to user.");
      }
    }
    //website mod
    if (user.isMod) {
      try {
        await member.addRole("555455030136668160");
      } catch (e) {
        console.log("Failed to add role to user.");
      }
    }
  }
};
