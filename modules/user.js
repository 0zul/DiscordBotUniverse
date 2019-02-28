const r = require('./database');
const client = require('./discord-bot');
const settings = require('../settings.json');

const configure = (req, res, next) => {
if (req.user) {
	r.table('users').get(req.user.id).run(async (error, userInfo) => {
    if (userInfo.isAdmin == true) req.user.admins = true
    if (userInfo.isMod == true) req.user.mods = true
    res.locals.user = req.user;
	next()
});
} else {
	res.locals.user = req.user;
	next();
}
}

const auth = (req, res, next) => {
    if (req.user) {
        next()
    } else {
        res.redirect('/auth')
    }
}

const mods = (req, res, next) => {
	if (req.user && req.user.mods || req.user.admins) {
		next();
	} else {
		res.status(400).render('error', { title: 'Error', status: 400, message: 'You are not a Website Moderator.' });
	}
};

const isBanned = (req, res, next) => {
    if (req.user) {
     r.table('users').get(req.user.id).run(async (error, userInfo) => {
        if (userInfo.isBanned == true) {
            res.status(401).render('error', { title: 'Error', status: 401, message: 'You are banned from adding bots.'})
        } else {
         next()
        }
    });
    } else {
        next();
    }
    }

const admins = (req, res, next) => {
	if (req.user && req.user.admins) {
		next();
	} else {
		res.status(400).render('error', { title: 'Error', status: 400, message: 'You are not a Website Administrator.' });
	}
};

const inServer = (req, res, next) => {

    if (req.user) {
        if (!client.guilds.get(settings.guildID).members.find(u => u.id == req.user.id)) {
            res.status(400).render('error', { title: 'Error', status: 400, message: 'You must be in our Discord guild to add a bot.' }); 
        } else {
            next()
        }
    } else {
        res.redirect('/auth')
    }
}


module.exports = {
    configure, auth, mods, admins, inServer, isBanned
}
