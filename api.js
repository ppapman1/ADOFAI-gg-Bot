const { MessageActionRow , MessageButton } = require('discord.js');
const axios = require('axios');

const setting = require('./setting.json');
const main = require("./main");
const lang = require('./lang');

const api = axios.create({
    baseURL: setting.API
});

module.exports.searchLevel = async (query, minDifficulty, maxDifficulty, minBpm, maxBpm, minTiles, maxTiles) => {
    const search = await api.get('/levels', {
        params: {
            offset: 0,
            amount: 25,
            sort: 'RECENT_DESC',
            query,
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

module.exports.getPPEmbedField = async (interaction, offset = 0, amount = 5) => {
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
                            .setCustomId(`rankingpage_${interaction.user.id}_${offset - amount}`)
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'PREV'))
                            .setStyle('PRIMARY')
                            .setDisabled(offset == 0),
                        new MessageButton()
                            .setCustomId(`rankingpage_${interaction.user.id}_${rank - 1}`)
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'NEXT'))
                            .setStyle('PRIMARY')
                            .setDisabled(leftCount == 0)
                    )
            ]
        }
    }
}