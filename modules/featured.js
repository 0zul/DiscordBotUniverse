const r = require('./database');

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();

    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();

    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();

    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec
}

const feature = async () => {
if (getDateTime() == "00:00:00" || getDateTime() == "12:00:00") {
    r.table('bots').update({ featured: false }).run();
    r.table('bots').filter({ approved: true, verified: false }).sample(4).update({ featured: true }).run();
    r.table('bots').filter({ approved: true, verified: true }).sample(4).update({ featured: true }).run();
}
};

// Reset the featured bots at 12am & 12pm each day.
setInterval(feature, (1000));

