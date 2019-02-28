const express = require('express');
const router = express.Router();
const r = require('../modules/database');
const user = require('../modules/user');
const chunk = require('chunk');
const client = require('../modules/discord-bot/index')

router.get('/', user.configure, async (req, res, next) => {
	r.table('partners').run(async (error, users) => {
		const userChunk = chunk(users, 3);
		res.render('partners/index', { title: 'Partners', usersData: users, userChunk })
	})
});

module.exports = router;