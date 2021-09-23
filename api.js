const { MessageActionRow , MessageButton, MessageEmbed} = require('discord.js');
const axios = require('axios');

const setting = require('./setting.json');
const main = require("./main");
const lang = require('./lang');
const utils = require("./utils");
const Server = require("./server.json");

const api = axios.create({
    baseURL: setting.API
});

module.exports.searchLevel = async data => {
    let {
        query,
        minDifficulty,
        maxDifficulty,
        minBpm,
        maxBpm,
        minTiles,
        maxTiles,
        sort,
        amount
    } = data;

    sort = sort || 'RECENT_DESC';
    amount = amount || 25;

    const search = await api.get('/levels', {
        params: {
            offset: 0,
            amount,
            sort,
            queryTitle: query,
            queryArtist: query,
            queryCreator: query,
            minDifficulty,
            maxDifficulty,
            minBpm,
            maxBpm,
            minTiles,
            maxTiles
        }
    });

    return search.data.results;
}

module.exports.getLevel = async id => {
    const level = await api.get(`/levels/${id}`);

    return level.data;
}

module.exports.getLevelInfoMessage = (level, language = 'en') => {
    const title = `${level.artists.join(' & ')} - ${level.title}`;

    if(level.workshop) level.workshop = level.workshop.trim();
    if(level.download) level.download = level.download.trim();
    else return {
        content: lang.langByLangName(language, 'DOWNLOAD_LINK_MISSING'),
        ephemeral: true
    }

    const levelEmoji = main.Server.emoji[level.difficulty.toString()];
    if(!levelEmoji) return {
        content: lang.langByLangName(language, 'UNSUPPORTED_LEVEL'),
        ephemeral: true
    }

    return {
        embeds: [
            new MessageEmbed()
                .setColor('#349eeb')
                .setTitle(title)
                .setURL(`${setting.MAIN_SITE}/levels/${level.id}`)
                .setDescription(`Level by ${level.creators.join(' & ')}`)
                .addField('Lv.', levelEmoji.toString(), true)
                .addField('BPM', level.minBpm.toString(), true)
                .addField('Tiles', level.tiles.toString(), true)
                .addField('Description', level.description || `There's no description for this level.`)
                .setImage(`https://i.ytimg.com/vi/${utils.parseYouTubeLink(level.video).videoCode}/original.jpg`)
        ],
            content: '\u200B',
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel(lang.langByLangName(language, 'DOWNLOAD'))
                        .setStyle('LINK')
                        .setURL(level.download)
                        .setEmoji(Server.emoji.download),
                    new MessageButton()
                        .setLabel(lang.langByLangName(language, 'WORKSHOP'))
                        .setStyle('LINK')
                        .setURL(level.workshop || level.download)
                        .setEmoji(Server.emoji.steam)
                        .setDisabled(!level.workshop),
                    new MessageButton()
                        .setLabel(lang.langByLangName(language, 'WATCH_VIDEO'))
                        .setStyle('LINK')
                        .setURL(level.video)
                        .setEmoji(Server.emoji.youtube)
                )
        ]
    }
}

module.exports.getPPEmbedField = async (userid, channel, offset = 0, amount = 5) => {
    if(typeof offset != 'number' || typeof amount != 'number' || offset < 0 || amount < 0) return;

    const rankingRequest = await api.get('/ranking', {
        params: {
            offset,
            amount
        }
    });

    const ranking = rankingRequest.data;

    const leftCount = ranking.count - (offset + ranking.results.length);

    const fields = [];
    let rank = offset + 1;
    for(let d of ranking.results) {
        fields.push({
            name: `#${rank}`,
            value: d.name
        }, {
            name: 'Total PP',
            value: Math.floor(d.totalBpm).toString(),
            inline: true
        }, {
            name: 'Highest Play',
            value: `[${d.bestPlay.artists.join(' & ')} - ${d.bestPlay.title}](${setting.MAIN_SITE}/levels/${d.bestPlay.levelId})`,
            inline: true
        }, {
            name: '\u200B',
            value: `${d.bestPlay.speed / 100}x ${d.bestPlay.rawAccuracy ? d.bestPlay.rawAccuracy.toFixed(1) + '%' : ''} ${main.Server.emoji[d.bestPlay.difficulty.toString()]}`
        });

        rank++;
    }

    return {
        reply: {
            embeds: [
                {
                    color: '#349eeb',
                    title: lang.langByLangName(interaction.dbUser.lang, 'PP_RANKING'),
                    url: `${setting.MAIN_SITE}/ranks`,
                    fields: fields,
                    timestamp: new Date()
                }
            ],
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId(`rankingpage_${userid}_${offset - amount}`)
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'PREV'))
                            .setStyle('PRIMARY')
                            .setDisabled(offset == 0),
                        new MessageButton()
                            .setCustomId(`rankingpage_${userid}_${rank - 1}`)
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'NEXT'))
                            .setStyle('PRIMARY')
                            .setDisabled(leftCount == 0)
                    )
            ]
        }
    }
}