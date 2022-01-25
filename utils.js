const { MessageEmbed , Util } = require('discord.js');
const Url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const lang = require('./lang');
const tags = require('./tags.json');
const api = require('./api');

const ReasonTemplate = require('./schemas/reasonTemplate');
const Vote = require('./schemas/vote');
const VoteOption = require('./schemas/voteOption');

let client;

module.exports.setup = c => {
    client = c;
}

const escapeRegExp = s => s.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
module.exports.escapeRegExp = escapeRegExp;

module.exports.checkBatchim = word => {
    if (typeof word !== 'string') return null;

    let lastLetter = word[word.length - 1];

    if(/[a-zA-Z]/.test(lastLetter)) {
        const moem = [ 'a' , 'e' , 'i' , 'o' , 'u' ];
        return moem.includes(lastLetter);
    }

    if(!isNaN(lastLetter)) {
        const k_number = '영일이삼사오육칠팔구십'.split('');
        for(let i = 0; i <= 10; i++) {
            lastLetter = lastLetter.replace(new RegExp(escapeRegExp(i.toString()), 'g'), k_number[i]);
        }
    }
    const uni = lastLetter.charCodeAt(0);

    if (uni < 44032 || uni > 55203) return null;

    return (uni - 44032) % 28 !== 0;
}

module.exports.getYoilString = num => {
    const yoilmap = [
        '일',
        '월',
        '화',
        '수',
        '목',
        '금',
        '토'
    ]

    return yoilmap[num];
}

module.exports.getEnglishMonthString = num => {
    const monthmap = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    return monthmap[num - 1];
}

module.exports.chunk = (str, n, put) => {
    return Array.from(Array(Math.ceil(str.length/n)), (_,i)=>str.slice(i*n,i*n+n)).join(put);
}

module.exports.parseYouTubeLink = link => {
    const parsedUrl = Url.parse(link);
    const parsedQuery = querystring.parse(parsedUrl.query);

    let videoCode;

    if([ 'youtube.com' , 'www.youtube.com' ].includes(parsedUrl.host)) videoCode = parsedQuery.v;
    if([ 'youtu.be' ].includes(parsedUrl.host)) videoCode = parsedUrl.path.slice(1);

    return {
        videoCode
    }
}

module.exports.increaseBrightness = (hex, percent) => {
    hex = hex.replace(/^\s*#|\s*$/g, '');

    if(hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    const r = parseInt(hex.substr(0, 2), 16),
          g = parseInt(hex.substr(2, 2), 16),
          b = parseInt(hex.substr(4, 2), 16);

    return '#' +
        ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

module.exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max + 1);
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.msToTime = (duration, en = false) => {
    // const weeks = duration / (1000 * 60 * 60 * 24 * 7);
    // const absoluteWeeks = Math.floor(weeks);
    // const w = absoluteWeeks ? (absoluteWeeks + '주 ') : '';

    // const days = (weeks - absoluteWeeks) * 7;
    const days = duration / (1000 * 60 * 60 * 24);
    const absoluteDays = Math.floor(days);
    const d = absoluteDays ? (absoluteDays + (en ? ` Day${absoluteDays > 1 ? 's' : ''} ` : '일 ')) : '';

    const hours = (days - absoluteDays) * 24;
    const absoluteHours = Math.floor(hours);
    const h = absoluteHours ? (absoluteHours + (en ? ` Hour${absoluteHours > 1 ? 's' : ''} ` : '시간 ')) : '';

    const minutes = (hours - absoluteHours) * 60;
    const absoluteMinutes = Math.floor(minutes);
    const m = absoluteMinutes ? (absoluteMinutes + (en ? ` Minute${absoluteMinutes > 1 ? 's' : ''} ` : '분 ')) : '';

    const seconds = (minutes - absoluteMinutes) * 60;
    const absoluteSeconds = Math.floor(seconds);
    const s = absoluteSeconds ? (absoluteSeconds + (en ? ` Second${absoluteSeconds > 1 ? 's' : ''} ` : '초 ')) : '';

    return (/* w + */ d + h + m + s).trim();
}

module.exports.msToTimeNumber = s => {
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;

    return (hrs > 0 ? `${hrs}:` : '') + `${mins}:${secs.toString().padStart(2, '0')}`;
}

module.exports.parseDiscordCodeBlock = str => {
    let codeBlock = str.match(/```(.+)\n((?:.*?\r?\n?)*)\n```/);
    if(!codeBlock) codeBlock = str.match(/```((?:.*?\r?\n?)*)```/s);
    if(!codeBlock) return null;

    const language = codeBlock.length > 1 ? codeBlock[1] : null;
    const code = codeBlock[codeBlock.length > 1 ? 2 : 1];

    return {
        language,
        code
    }
}

const tagByID = {};
for(let c in tags) for(let t in tags[c]) {
    tags[c][t].emojiName = t;
    tagByID[tags[c][t].id] = tags[c][t];
}
module.exports.getTagByID = tag => {
    return tagByID[tag];
}

module.exports.subCommandHandler = directory => async interaction => {
    let command = interaction.options.getSubcommand();
    if(!fs.existsSync(`./commands/${directory}/${command}.js`)) command = interaction.options.getSubcommandGroup();

    if(fs.existsSync(`./commands/${directory}/${command}.js`)) {
        const file = require.resolve(`./commands/${directory}/${command}.js`);
        if(process.argv[2] === '--debug') delete require.cache[file];
        const handler = require(file);
        if(handler.commandHandler) handler.commandHandler(interaction);
        else handler(interaction);
    }
    else interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
        ephemeral: true
    });
}

module.exports.autoCompleteHandler = directory => async interaction => {
    let command = interaction.options.getSubcommand();
    if(!fs.existsSync(`./commands/${directory}/${command}.js`)) command = interaction.options.getSubcommandGroup();

    if(fs.existsSync(`./commands/${directory}/${command}.js`)) {
        const file = require.resolve(`./commands/${directory}/${command}.js`);
        if(process.argv[2] === '--debug') delete require.cache[file];
        const handler = require(file);
        if(handler.autoCompleteHandler) handler.autoCompleteHandler(interaction);
    }
}

module.exports.reasonAutoCompleteHandler = type => async interaction => {
    const reason = interaction.options.getString('reason');
    const reasonRegex = new RegExp(module.exports.escapeRegExp(reason), 'i');

    const reasons = await ReasonTemplate.find({
        type,
        reason: {
            $regex: reasonRegex
        }
    }).limit(25);
    if(!reasons.length) return interaction.respond([]);

    return interaction.respond(reasons.map(a => ({
        name: a.reason,
        value: a.reason
    })));
}

module.exports.levelAutoCompleteHandler = async interaction => {
    const { options } = interaction;

    const query = options.getString('query').replace('{showcensored}', '');

    if(!query) return interaction.respond([]);

    const queryRegex = new RegExp(module.exports.escapeRegExp(query), 'i');
    const searchQuery = {
        query,
        minDifficulty: options.getNumber('mindifficulty'),
        maxDifficulty: options.getNumber('maxdifficulty'),
        minBpm: options.getNumber('minbpm'),
        maxBpm: options.getNumber('maxbpm'),
        minTiles: options.getNumber('mintiles'),
        maxTiles: options.getNumber('maxtiles'),
        showNotVerified: options.getBoolean('shownotverified'),
        // showCensored: options.getBoolean('showcensored')
    }
    const search = await api.searchLevel(searchQuery);

    if(!search.length) return interaction.respond([]);

    const complete = [];

    for(let level of search) {
        if(complete.length < 25 && !complete.includes(level.title) && queryRegex.test(level.title)) complete.push(level.title);
        for(let artist of level.artists) if(!complete.includes(artist) && queryRegex.test(artist)) complete.push(artist);
        for(let creator of level.creators) if(!complete.includes(creator) && queryRegex.test(creator)) complete.push(creator);

        if(complete.length >= 25) break;
    }

    return interaction.respond(complete.slice(0, 25).map(a => ({
        name: a,
        value: a
    })));
}

module.exports.textProgressBar = (percentage, size) => {
    percentage /= 100;

    const progress = Math.round(size * percentage);
    const emptyProgress = size - progress;

    return `${'▇'.repeat(progress)}${' '.repeat(emptyProgress)}`;
}

module.exports.realtimeVoteEmbed = async message => {
    const messageID = message.id;

    const vote = await Vote.findOne({
        message: messageID
    });
    if(!vote) return;

    const voteOptions = await VoteOption.find({
        message: messageID
    });
    if(!voteOptions.length) return;

    const totalVotes = voteOptions.reduce((a, b) => a + b.users.length, 0);

    let user;
    try {
        user = await client.users.fetch(vote.startedBy);
    } catch(e) {}

    const fields = voteOptions.map(a => ({
        name: Util.escapeMarkdown(a.name),
        value: `${a.description ? `${a.description}\n` : ''}[${module.exports.textProgressBar((a.users.length / totalVotes || 0) * 100, 16)}] ${((a.users.length / totalVotes || 0) * 100).toFixed(2)}% (\`${a.users.length}\` Vote${a.users.length > 1 ? 's' : ''})`
    }));

    return new MessageEmbed()
        .setColor('#349eeb')
        .setAuthor({
            name: user?.username || 'Unknown User',
            iconURL: user?.avatarURL()
        })
        .setTitle(Util.escapeMarkdown(vote.question))
        .setDescription(`${vote.roles.length ? `For : ${vote.roles.map(r => message.guild.roles.cache.get(r).toString()).join(', ')}\n` : ''}Total Vote${totalVotes > 1 ? 's' : ''} : \`${totalVotes}\`\nPicked : \`${voteOptions.reduce((a, b) => a.users.length > b.users.length ? a : b).name}\``)
        .addFields(fields)
        .setTimestamp();
}