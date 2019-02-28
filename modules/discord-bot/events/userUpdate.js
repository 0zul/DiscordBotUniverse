const r = require('../../database');

module.exports = async (client, oldUser, newUser) => {
    if (oldUser.bot) {
        const bot = await r.table('bots').get(oldUser.id).run();
        if (!bot) return;
        r.table('bots').get(oldUser.id).update({
            name: newUser.username,
            avatar: newUser.avatar
        }).run()
    } else {
        const user = await r.table('users').get(oldUser.id).run();
        if (!user) return;
        r.table('users').get(oldUser.id).update({
            username: newUser.username,
            tag: newUser.tag,
            avatar: newUser.avatar
        }).run()  
    }
};
  