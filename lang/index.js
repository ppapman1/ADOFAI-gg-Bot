const fs = require('fs');

let lang = {};
let channelMap = {};

let loaded = false;

const load = () => {
    lang = {};
    channelMap = {};

    for(let f of fs.readdirSync('./lang')) {
        if(!f.endsWith('.json')) continue;

        const langFile = JSON.parse(fs.readFileSync(`./lang/${f}`).toString());
        const langName = f.replace('.json', '');
        lang[langName] = langFile;
        channelMap[langFile.CHANNEL] = langName;
    }

    loaded = true;
}

module.exports.load = load;

module.exports.langByChannel = (channel, key) => {
    if(!loaded) load();

    let langName = channelMap[channel.id];
    if(!langName) langName = 'en';

    let result = lang[langName][key];
    if(!result) result = lang['ko'][key];
    if(!result) result = `missing key "${key}"`;

    return result;
}