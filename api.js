const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Util} = require('discord.js');
const axios = require('axios');
const querystring = require('querystring');

const setting = require('./setting.json');
const main = require("./main");
const lang = require('./lang');
const utils = require("./utils");
const Server = require("./server.json");
const tags = require('./tags.json');
const sorts = require('./sort.json');

const api = axios.create({
    baseURL: setting.API
});

module.exports.searchLevel = async (data, getFullData = false) => {
    let {
        offset,
        query,
        minDifficulty,
        maxDifficulty,
        minBpm,
        maxBpm,
        minTiles,
        maxTiles,
        sort,
        amount,
        includeTags,
        showNotVerified,
        showCensored
    } = data;

    offset = offset || 0;
    sort = sort || 'RECENT_DESC';
    amount = amount || 25;

    const search = await api.get('/levels', {
        params: {
            offset,
            amount,
            sort,
            query,
            minDifficulty,
            maxDifficulty,
            minBpm,
            maxBpm,
            minTiles,
            maxTiles,
            includeTags,
            showNotVerified,
            showCensored
        },
        paramsSerializer: querystring.stringify
    })

    if(getFullData) return search.data;
    else return search.data.results;
}

module.exports.getLevel = async id => {
    try {
        const level = await api.get(`/levels/${id}`);
        return level.data;
    } catch(e) {
        const discordMessage = {
            embeds: [
                new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('API Error')
                    .setDescription(`\`\`\`\n${Util.escapeCodeBlock(e.toString())}\n\`\`\`\n[이곳을 눌러](${setting.ADOFAIGG_STATUS}) 서버 상태를 확인하세요.\n[Click here](${setting.ADOFAIGG_STATUS}) to check the server status.`)
                    .setFooter({
                        text: e.config.baseURL + e.config.url
                    })
                    .setTimestamp()
            ]
        };

        return {
            error: true,
            data: e,
            discordMessage
        }
    }
}

module.exports.getLevelInfoMessage = (level, language = 'en', random = false, musicButton = false) => {
    const title = `${level.artists.join(' & ')} - ${level.title}`;

    if(level.workshop) level.workshop = level.workshop.trim();
    if(level.download) level.download = level.download.trim();
    else return {
        content: lang.langByLangName(language, 'DOWNLOAD_LINK_MISSING'),
        ephemeral: true
    }

    let difficultyString = level.difficulty.toString();
    if(level.censored) difficultyString = 'minus2';

    const levelEmoji = main.Server.emoji[difficultyString] || difficultyString;
    // if(!levelEmoji) return {
    //     content: lang.langByLangName(language, 'UNSUPPORTED_LEVEL'),
    //     ephemeral: true
    // }

    const levelInfoButtons = [
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
    ];

    if(musicButton) levelInfoButtons.push(
        new MessageButton()
            .setCustomId(`addQueue_${utils.parseYouTubeLink(level.video).videoCode}`)
            .setLabel(lang.langByLangName(language, 'PLAY_THIS_MUSIC'))
            .setStyle('PRIMARY')
            .setEmoji('🎵')
    );

    const components = [
        new MessageActionRow()
            .addComponents(levelInfoButtons)
    ];

    if(random) components.push(
        new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('reroll')
                    .setLabel(lang.langByLangName(language, 'REROLL'))
                    .setStyle('PRIMARY')
                    .setEmoji(Server.emoji.reroll)
            )
    );

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
                .addField('Tags', level.tags.length ? level.tags.map(t => main.Server.emoji[utils.getTagByID(t.id)?.emojiName]?.toString()
                    || main.Server.emoji.noEmoji.toString()).join(' ') : 'No Tags')
                .addField('Description', level.description || `There's no description for this level.`)
                .setImage(`https://i.ytimg.com/vi/${utils.parseYouTubeLink(level.video).videoCode}/original.jpg`)
                .setFooter({
                    text: `ID : ${level.id}`
                })
        ],
        content: '\u200B',
        components
    }
}

module.exports.getSearchList = (search, page, totalPage, userid, language = 'en', selectedTags = [], sort = 'RECENT_DESC') => {
    if (!userid) return null;

    const selectOptions = [];

    if(!search.length) selectOptions.push({
        label: 'how did you found this?',
        value: 'fake'
    });
    else for(let l of search) {
        const title = `${l.artists.join(' & ')} - ${l.title}`;

        selectOptions.push({
            label: title.substring(0, 100),
            description: `by ${l.creators.join(' & ')} | ID : ${l.id}`,
            value: `showlevel_${userid}_${l.id}`,
            emoji: {
                id: Server.emoji[l.censored ? 'minus2' : l.difficulty.toString()]
            }
        });
    }

    const components = [
        new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(`showlevel`)
                    .setPlaceholder(lang.langByLangName(language, 'SELECT_LEVEL_SELECT_MENU'))
                    .addOptions(selectOptions)
            ),
        new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev')
                    .setLabel(lang.langByLangName(language, 'PREV'))
                    .setStyle('PRIMARY')
                    .setDisabled(page <= 1),
                new MessageButton()
                    .setCustomId('page')
                    .setLabel(`${page} / ${totalPage}`)
                    .setStyle('SECONDARY')
                    .setDisabled(),
                new MessageButton()
                    .setCustomId('next')
                    .setLabel(lang.langByLangName(language, 'NEXT'))
                    .setStyle('PRIMARY')
                    .setDisabled(page >= totalPage),
                new MessageButton()
                    .setCustomId('removeTags')
                    .setLabel(lang.langByLangName(language, 'REMOVE_TAGS'))
                    .setStyle('SECONDARY')
                    .setEmoji('❌')
                    .setDisabled(!selectedTags.length)
            )
    ]

    const tagOptions = [];

    for(let tagSubject in tags) {
        for(let tagName in tags[tagSubject]) {
            const tag = tags[tagSubject][tagName];
            tagOptions.push({
                label: tag.title[language],
                description: tag.description[language],
                value: tag.id.toString(),
                emoji: {
                    id: Server.emoji[tagName]
                },
                default: selectedTags.includes(tag.id.toString())
            });
        }
    }

    components.unshift(
        new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('tagSearch')
                    .setPlaceholder(lang.langByLangName(language, 'TAG_SEARCH_SELECT_MENU'))
                    .addOptions(tagOptions)
                    .setMinValues(1)
            )
    );

    const sortOptions = [];

    for(let sortSubject in sorts) sortOptions.push({
        label: sorts[sortSubject].name[language],
        value: sortSubject,
        emoji: {
            id: Server.emoji[sortSubject]
        },
        default: sort === sortSubject
    });

    components.unshift(
        new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('sort')
                    .addOptions(sortOptions)
            )
    );

    return {
        content: lang.langByLangName(language, 'SELECT_LEVEL_MESSAGE'),
        components
    }
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
                            .setDisabled(offset === 0),
                        new MessageButton()
                            .setCustomId('fake')
                            .setLabel(`${Math.ceil(offset / 5) + 1} / ${Math.ceil(ranking.count / 5)}`)
                            .setStyle('SECONDARY')
                            .setDisabled(),
                        new MessageButton()
                            .setCustomId(`rankingpage_${interaction.user.id}_${rank - 1}`)
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'NEXT'))
                            .setStyle('PRIMARY')
                            .setDisabled(leftCount === 0)
                    )
            ]
        }
    }
}