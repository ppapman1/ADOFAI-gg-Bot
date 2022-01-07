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

module.exports.langByLangName = (langName, key) => {
    if(!loaded) load();

    if(!lang[langName]) langName = 'en';

    let result = lang[langName][key];
    if(!result) result = lang['ko'][key];
    if(!result) result = `missing key "${key}"`;

    return result;
}

module.exports.getLangChoices = () => {
    if(!loaded) load();

    const result = [];
    for(let i in lang) result.push({
        name: lang[i].DISPLAY_NAME,
        value: i
    });

    return result;
}

module.exports.getFirstTimeString = () => {
    if(!loaded) load();

    const result = [];
    for(let l in lang) {
        const str = lang[l].FIRST_TIME_BOT;
        if(str) result.push(str);
    }

    return result.join('\n');
}

module.exports.getCommandDescription = key => {
    if(!loaded) load();

    const result = [];
    for(let l in lang) {
        const str = lang[l][`COMMAND_${key}`];
        if(str) result.push(str);
    }

    return result.join(' // ').substring(0, 100);
}