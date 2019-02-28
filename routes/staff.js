const express = require('express');
const router = express.Router();
const r = require('../modules/database');
const user = require('../modules/user');
const chunk = require('chunk');
const child_process = require('child_process');
const settings = require('../settings.json');

router.get('/', user.configure, user.auth, user.mods, async (req, res, next) => {
	const bots = await r.table('bots').filter({ approved: true }).count().run();
	const unaprooved_bots = await r.table('bots').filter({ approved: false }).count().run();
	const verified_bots = await r.table('bots').filter({ verified: true }).count().run();
	//const users = await r.table('users').count().run()
	const users = await r.table('users').count().run()
	res.render('staff/home', { title: 'Staff Panel', bots, unaprooved_bots, verified_bots, users })
});

router.get('/queue', user.configure, user.auth, user.mods, (req, res, next) => {
	r.table('bots').filter({ approved: false }).merge(bot => ({
		ownerinfo: bot('owners')
			.default([])
			.append(bot('owner'))
			.map(id => r.table('users').get(id))
			.default({ username: 'Unknown', tag: 'Unknown#0000' })
	})).run(async (error, bots) => {
		const botChunk = chunk(bots, 3);
		res.render('staff/bots', { title: 'Bot Queue', botsData: bots, botChunk })
	})
});

router.get('/admin/users', user.configure, user.auth, user.admins, (req, res, next) => {
	r.table('users').run(async (error, users) => {
		const userChunk = chunk(users, 3);
		res.render('staff/users', { title: 'User Manager', usersData: users, userChunk })
	})
});

router.get('/admin/restart', user.configure, user.auth, user.admins, async (req, res, next) => {
	console.log("Site restarted by: " + req.user.username + " (" + req.user.id + ")");
	res.status(200).render('error', { title: 'Success', status: 200, message: 'Restarting... please wait...' });
	child_process.exec("pm2 restart " + settings.pm2_process);
});

router.get('/admin/pull', user.configure, user.auth, user.admins, async (req, res, next) => {
	console.log("Repo pulled by: " + req.user.username + " (" + req.user.id + ")");
	res.status(200).render('error', { title: 'Success', status: 200, message: 'Successfully Pulled!' });
	child_process.exec("git pull");
});

router.get('/admin/verification', user.configure, user.auth, user.admins, (req, res, next) => {
	r.table('verification_apps')
	.merge(info => ({
		botinfo: r.table('bots').get(info('id')),
		ownerInfo: r.table('users').get(info('user'))
	})) 
	.run(async (error, apps) => {
		res.render('staff/apps', { title: 'Verification', apps })
	})
});

router.get('/admin/rank/:id/:rank', user.configure, user.auth, user.admins, async (req, res, next) => {
	const user = await r.table('users').get(req.params.id).run();
	let rank = req.params.rank;
	if (!user) return res.status(404).render('error', { title: 'Error', status: 404, message: `User ${req.params.id} does not exist.` });

	if (rank == 'User') {
		r.table('users').get(req.params.id).update({ isMod: false, isAdmin: false }).run();
		res.status(200).render('error', { title: 'Success', status: 200, message: `Assigned User to ${user.tag}.` });
	} else if (rank == 'Verified Developers') {
		if (user.isVerifiedDev == true) {
			r.table('users').get(req.params.id).update({ isVerifiedDev: false }).run()
			res.status(200).render('error', { title: 'Success', status: 200, message: `Unassigned Verified Developers from ${user.tag}.` });
		} else {
			r.table('users').get(req.params.id).update({ isVerifiedDev: true }).run()
			res.status(200).render('error', { title: 'Success', status: 200, message: `Assigned Verified Developers to ${user.tag}.` });
		}
	} else if (rank == 'Mod') {
		r.table('users').get(req.params.id).update({ isMod: true }).run()
		res.status(200).render('error', { title: 'Success', status: 200, message: `Assigned Moderator to ${user.tag}.` });
	} else if (rank == 'Admin') {
		r.table('users').get(req.params.id).update({ isMod: true, isAdmin: true }).run()
		res.status(200).render('error', { title: 'Success', status: 200, message: `Assigned Admin to ${user.tag}.` });
	} else {
		res.status(400).render('error', { title: 'Error', status: 400, message: `Invalid rank ${req.params.rank}.` });
	}
})

router.get('/admin/:id/delete', user.configure, user.auth, user.admins, async (req, res, next) => {
	const user = await r.table('users').get(req.params.id).run();
	if (user.isMod == true || user.isAdmin == true) return res.status(400).render('error', { title: 'Success', status: 400, message: 'That user is a moderator / admin. Please unassign their rank and try again.' });
	if (!user) return res.status(404).render('error', { title: 'Error', status: 404, message: `User ${req.params.id} does not exist.`, user });
	res.render('staff/delete', { title: 'Delete User', user })
})

router.post('/admin/:id/delete', user.configure, user.auth, user.admins, async (req, res, next) => {
	const user = await r.table('users').get(req.params.id).run();
	if (!user) return res.status(404).render('error', { title: 'Error', status: 404, message: `User ${req.params.id} does not exist.`, user });
	if (user.isMod == true || user.isAdmin == true) return res.status(400).render('error', { title: 'Success', status: 400, message: 'That user is a moderator / admin. Please unassign their rank and try again.' });
	r.table('users').get(req.params.id).delete().run()
	res.status(200).render('error', { title: 'Success', status: 200, message: `Successfully deleted ${user.tag}.`});
})

router.get('/admin/:id/ban', user.configure, user.auth, user.admins, async (req, res, next) => {
	const user = await r.table('users').get(req.params.id).run();
	if (!user) return res.status(404).render('error', { title: 'Error', status: 404, message: `User ${req.params.id} does not exist.`, user });
	if (user.isMod == true || user.isAdmin == true) return res.status(400).render('error', { title: 'Success', status: 400, message: 'That user is a moderator / admin. Please unassign their rank and try again.' });
	if (user.isBanned) {
		r.table('users').get(req.params.id).update({ isBanned: false }).run()
		res.status(200).render('error', { title: 'Success', status: 200, message: `Successfully unbanned ${user.tag}.` });
	} else {
		r.table('users').get(req.params.id).update({ isBanned: true }).run()
		res.status(200).render('error', { title: 'Success', status: 200, message: `Successfully banned ${user.tag}.` });
	}
})


module.exports = router;
