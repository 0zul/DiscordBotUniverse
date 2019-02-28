const express = require('express');
const router = express.Router();
const r = require('../modules/database');
const user = require('../modules/user');
const chunk = require('chunk');

const perm = (level) =>
	async (req, res, next) => {
		const getUser = await r.table('users').get(req.params.id || req.body.id).run();

		if (!getUser) {
			res.status(404).render('error', { title: 'Error', status: 404, message: 'User not found.' });
		} else if ((req.user.admin) || (level <= 2 && getUser.id == req.user.admin || level <= 3 && getUser.id == req.user.mod) || (level <= 1 && getUser.id == req.user.id)) {
			next();
		} else {
			res.status(400).render('error', { title: 'Error', status: 401, message: 'You are not allowed to edit another persons profile.' });
		}
};

router.get('/:id', user.configure, async (req, res, next) => {
    const getUser = await r.table('users').get(req.params.id).run();
    if (!getUser) return res.status(404).render('error', { title: 'Error', status: 404, message: 'User not found.'})
    r.table('bots')
    .merge(bot => ({
		ownerinfo: bot('owners')
			.default([])
			.append(bot('owner'))
			.map(id => r.table('users').get(id))
			.default({ username: 'Unknown', tag: 'Unknown#0000' })
    }))
    .run(async (error, bots) => {
    r.table('bots_backup')
    .merge(bot => ({
		ownerinfo: bot('owners')
			.default([])
			.append(bot('owner'))
			.map(id => r.table('users').get(id))
			.default({ username: 'Unknown', tag: 'Unknown#0000' })
    }))
    .filter({ owner: req.params.id }).run(async (error, bots_backup) => {
        bots = bots.filter(bot => (req.params.id == bot.owner) || bot.owners.includes(req.params.id));
        const botChunk = chunk(bots, 3);
        const storedChunk = chunk(bots_backup, 3);
		res.render('profile', { title: getUser.tag, botsData: bots, botChunk, userInfo: getUser, storedBotsData: bots_backup, storedChunk })
    })
})
});

router.get('/:id/edit', user.configure, user.auth, perm(0), async (req, res, next) => {
    const getUser = await r.table('users').get(req.params.id).run();
    //const getEdit = await r.table('users').get(getUser.lastedited, getUser.lasteditedby).run();
    const getEdit = await r.table('users').get(req.user.id).run();
    res.render('users/edit', { title: 'Edit Profile', getUser, getEdit });
})

router.post('/:id/edit', user.configure, user.auth, perm(1), async (req, res, next) => {
    if (!/^https?\:.*\.(?:jpg|gif|png)$/.test(req.body.background) && req.body.background !== "") { 
        return res.status(400).render('error', { title: 'Error', status: 400, message: 'Your background URL does not end in .jpg or .png or .gif' });
    }
    else if (req.body.bio > 200) {
        return res.status(413).render('error', { title: 'Error', status: 413, message: 'You provided a bio that was too long (200 Max)' })
    }
    const getUser = await r.table('users').get(req.params.id).run();
    const update = await r.table('users').get(req.params.id).update({
        bio: req.body.bio.replace(/<(script|object|blockquote)[\s\S]*?>[\s\S]*?<\/(script|object|blockquote)>/,"").replace(/(href|src)=('|"|`)javascript:.*('|"|`)/,""),
        background: req.body.background,
        website: req.body.website,
        isMod: req.user.mod,
        isAdmin: req.user.admin,
        lastedited: Date.now(),
        lasteditedby: req.user.id
    }).run();
    res.redirect(`/user/${req.params.id}`);
})



module.exports = router;
