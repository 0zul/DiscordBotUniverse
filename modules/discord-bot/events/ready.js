
module.exports = client => {
    console.log(`Connected to ${client.guilds.size} guilds`)
    client.user.setActivity(`Discord Bot Universe | My prefix is % | ${client.users.size} members on this server. `, {
type: "LISTENING",
url: null
    });  
};
  