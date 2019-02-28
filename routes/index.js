const express = require('express');
const router = express.Router();
const r = require('../modules/database');
const user = require('../modules/user');
const chunk = require('chunk');
const client = require('../modules/discord-bot/index')

router.get('/', user.configure, async (req, res, next) => {
	const bots = await r.table('bots').filter({ featured: true })
		.merge(bot => ({ 
			random: r.random(1, 100 )
		}))
		.merge(bot => ({
			ownerinfo: bot('owners')
				.default([])
				.append(bot('owner'))
				.map(id => r.table('users').get(id))
				.default({ username: 'Unknown', tag: 'Unknown#0000' })
		}))
		.orderBy('random').run()
		const botChunk = chunk(bots, 3);
		res.render('index', { title: 'Home', botsData: bots, botChunk})
});


router.get('/bots', user.configure, async (req, res, next) => {
	const botCount = await r.table('bots').filter({ approved: true }).count().run()
	const bots = await r.table('bots').slice((20 * ((req.query.page) ? req.query.page : 1)) - 20, 20 * ((req.query.page) ? req.query.page : 1)).filter({ approved: true })
		.merge(bot => ({ 
			random: r.random(1, 100 )
		}))
		.merge(bot => ({
			ownerinfo: bot('owners')
				.default([])
				.append(bot('owner'))
				.map(id => r.table('users').get(id))
				.default({ username: 'Unknown', tag: 'Unknown#0000' })
		}))
		.orderBy('random').run()
		const botChunk = chunk(bots, 3)
		res.render('bots', { title: 'Bots', botChunk, bots, page: (req.query.page) ? parseInt(req.query.page) : 1, pages: Math.ceil(botCount / 20) })
})

module.exports = router;