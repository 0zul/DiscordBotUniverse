const express = require('express');
const router = express.Router();
const r = require('../modules/database');
const { Canvas } = require('canvas-constructor');
const fsn = require('fs-nextra');
const { get } = require('snekfetch');
const { resolve, join } = require('path');

/* GET api page. */
router.get('/', (req, res, next) => {
  res.redirect('/docs');
});

router.get('/bot/:id', async (req, res) => {
  r.table('bots').get(req.params.id).without('token').run(async (error, bot) => {
    if (!bot) return res.status(404).json({ message: 'Bot not found.' });
    res.status(200).json(bot)
  })
});

router.post('/bot/:id', async (req, res) => {
    const bot = await r.table('bots').get(req.params.id).run();
    const header = req.headers['authorization'];
    const amount = req.body.count || req.body.server_count || req.body.guild_count;
    if (!header || header == '') return res.status(400).json({ message: 'Authorization is required.' });
    if (!amount || amount == '') return res.status(400).json({ message: 'Server count is required.' });
    if (isNaN(amount)) return res.status(400).json({ message: 'Server count must be a valid number.' });
    if (!bot) return res.status(404).json({ message: 'Invalid bot.' });
    if (bot.token != header) return res.status(400).json({ message: 'Invalid authorization token.' });
    r.table('bots').get(req.params.id).update({ server_count: Number(amount) }).run()
    res.status(200).json({ message: 'Server count successfully updated.' })
});

  router.get('/bot/:id/widget', async (req, res) => {
    if (!await r.table('bots').get(req.params.id).run()) return res.status(404).json({ message: 'Bot not found.'})
    const bot = await r.table('bots').get(req.params.id).merge(bot => ({
      ownerinfo: bot('owners')
        .default([])
        .append(bot('owner'))
        .map(id => r.table('users').get(id))
        .default({ username: 'Unknown', tag: 'Unknown#0000' })
    })).run();
  
  const template = await fsn.readFile(`${process.cwd()}/modules/widgets/template.png`);
  const verified = await fsn.readFile(`${process.cwd()}/modules/widgets/verified.png`);
  const regex = /\?size=2048$/g;
  const { body: avatar } = await get(`https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}?size=128`);

  let owners = '';

  bot.ownerinfo.map(owner => {
      if (owner) {
          owners += owner.tag + "\n"
      }
  })

  Canvas.registerFont(resolve(join(__dirname, "../modules/widgets/OpenSans-Bold.ttf")), "OpenSans-Bold");
  const widget = new Canvas(400, 180, "png")
  .addImage(template, 0, 0, 400, 180)
  .addRoundImage(avatar, 20, 40, 100, 100, 50, true)
  .setTextAlign('right')
  .setTextFont('12px OpenSans-Bold') 
  .setColor('#FFFFFF')
  .addText(`${bot.name} ${bot.server_count > 0 ? `is on ${bot.server_count.toLocaleString()} servers.` : ''}`, 348, 20, 380)
  .setTextAlign('left')
  .setTextBaseline('top')
  .addText(owners, 140, 55, 260)
  if (bot.verified) widget.addImage(verified, 88, 108, 32, 32);
  res.set('Content-Type', 'image/png');
  res.send(await widget.toBuffer());
})

router.get('/bots/:id', async (req, res) => {
  const user = await r.table('users').get(req.params.id).run();
  if (!user) return res.status(200).json({ message: 'User not found.' });
  let bots = await r.table('bots').run();
  bots = bots.filter(bot => (req.params.id == bot.owner) || bot.owners.includes(req.params.id));
  if (bots.length == 0) return res.status(200).json({ bots: 'User has no bots.' })
  res.status(200).json({ bots: Array.from(bots.map((bot) => bot.id)) })
});

router.get('/user/:id', async (req, res) => {
  r.table('users').get(req.params.id).run(async (error, user) => {
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user)
  })
})
  .use('*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
  });

module.exports = router;
