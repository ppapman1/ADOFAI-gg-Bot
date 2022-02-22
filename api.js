const { ActionRow, ButtonComponent, ButtonStyle, Embed, SelectMenuComponent, SelectMenuOption, Util } = require('discord.js');
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
                new Embed()
                    .setColor(0xff0000)
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
        new ButtonComponent()
            .setLabel(lang.langByLangName(language, 'DOWNLOAD'))
            .setStyle(ButtonStyle.Link)
            .setURL(level.download)
            .setEmoji({
                id: Server.emoji.download
            }),
        new ButtonComponent()
            .setLabel(lang.langByLangName(language, 'WORKSHOP'))
            .setStyle(ButtonStyle.Link)
            .setURL(level.workshop || level.download)
            .setEmoji({
                id: Server.emoji.steam
            })
            .setDisabled(!level.workshop),
        new ButtonComponent()
            .setLabel(lang.langByLangName(language, 'WATCH_VIDEO'))
            .setStyle(ButtonStyle.Link)
            .setURL(level.video)
            .setEmoji({
                id: Server.emoji.youtube
            })
    ];

    if(musicButton) levelInfoButtons.push(
        new ButtonComponent()
            .setCustomId(`addQueue_${utils.parseYouTubeLink(level.video).videoCode}`)
            .setLabel(lang.langByLangName(language, 'PLAY_THIS_MUSIC'))
            .setStyle(ButtonStyle.Primary)
            .setEmoji({
                name: '🎵'
            })
    );

    const components = [
        new ActionRow()
            .addComponents(...levelInfoButtons)
    ];

    if(random) components.push(
        new ActionRow()
            .addComponents(
                new ButtonComponent()
                    .setCustomId('reroll')
                    .setLabel(lang.langByLangName(language, 'REROLL'))
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji({
                        id: Server.emoji.reroll
                    })
            )
    );

    return {
        embeds: [
            new Embed()
                .setColor(0x349eeb)
                .setTitle(title)
                .setURL(`${setting.MAIN_SITE}/levels/${level.id}`)
                .setDescription(`Level by ${level.creators.join(' & ')}`)
                .addField({
                    name: 'Lv.',
                    value: levelEmoji.toString(),
                    inline: true
                })
                .addField({
                    name: 'BPM',
                    value: level.minBpm.toString(),
                    inline: true
                })
                .addField({
                    name: 'Tiles',
                    value: level.tiles.toString(),
                    inline: true
                })
                .addField({
                    name: 'Tags',
                    value: level.tags.length ? level.tags.map(t => main.Server.emoji[utils.getTagByID(t.id)?.emojiName]?.toString()
                        || main.Server.emoji.noEmoji.toString()).join(' ') : 'No Tags'
                })
                .addField({
                    name: 'Description',
                    value: level.description || `There's no description for this level.`
                })
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

    if(!search.length) selectOptions.push(
        new SelectMenuOption()
            .setLabel('how did you found this?')
            .setValue('fake')
    );
    else for(let l of search) {
        const title = `${l.artists.join(' & ')} - ${l.title}`;

        selectOptions.push(
            new SelectMenuOption()
                .setLabel(title.substring(0, 100))
                .setDescription(`by ${l.creators.join(' & ')} | ID : ${l.id}`)
                .setValue(`showlevel_${userid}_${l.id}`)
                .setEmoji({
                    id: Server.emoji[l.censored ? 'minus2' : l.difficulty.toString()]
                })
        );
    }

    const components = [
        new ActionRow()
            .addComponents(
                new SelectMenuComponent()
                    .setCustomId(`showlevel`)
                    .setPlaceholder(lang.langByLangName(language, 'SELECT_LEVEL_SELECT_MENU'))
                    .addOptions(...selectOptions)
            ),
        new ActionRow()
            .addComponents(
                new ButtonComponent()
                    .setCustomId('prev')
                    .setLabel(lang.langByLangName(language, 'PREV'))
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page <= 1),
                new ButtonComponent()
                    .setCustomId('page')
                    .setLabel(`${page} / ${totalPage}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(),
                new ButtonComponent()
                    .setCustomId('next')
                    .setLabel(lang.langByLangName(language, 'NEXT'))
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page >= totalPage),
                new ButtonComponent()
                    .setCustomId('removeTags')
                    .setLabel(lang.langByLangName(language, 'REMOVE_TAGS'))
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji({
                        name: '❌'
                    })
                    .setDisabled(!selectedTags.length)
            )
    ]

    const tagOptions = [];

    for(let tagSubject in tags) {
        for(let tagName in tags[tagSubject]) {
            const tag = tags[tagSubject][tagName];
            tagOptions.push(
                new SelectMenuOption()
                    .setLabel(tag.title[language])
                    .setDescription(tag.description[language])
                    .setValue(tag.id.toString())
                    .setEmoji({
                        id: Server.emoji[tagName]
                    })
                    .setDefault(selectedTags.includes(tag.id.toString()))
            );
        }
    }

    components.unshift(
        new ActionRow()
            .addComponents(
                new SelectMenuComponent()
                    .setCustomId('tagSearch')
                    .setPlaceholder(lang.langByLangName(language, 'TAG_SEARCH_SELECT_MENU'))
                    .addOptions(...tagOptions)
                    .setMinValues(1)
            )
    );

    const sortOptions = [];

    for(let sortSubject in sorts) sortOptions.push(
        new SelectMenuOption()
            .setLabel(sorts[sortSubject].name[language])
            .setValue(sortSubject)
            .setEmoji({
                id: Server.emoji[sortSubject]
            })
            .setDefault(sort === sortSubject)
    );

    components.unshift(
        new ActionRow()
            .addComponents(
                new SelectMenuComponent()
                    .setCustomId('sort')
                    .addOptions(...sortOptions)
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
                new ActionRow()
                    .addComponents(
                        new ButtonComponent()
                            .setCustomId(`rankingpage_${interaction.user.id}_${offset - amount}`)
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'PREV'))
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(offset === 0),
                        new ButtonComponent()
                            .setCustomId('fake')
                            .setLabel(`${Math.ceil(offset / 5) + 1} / ${Math.ceil(ranking.count / 5)}`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(),
                        new ButtonComponent()
                            .setCustomId(`rankingpage_${interaction.user.id}_${rank - 1}`)
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'NEXT'))
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(leftCount === 0)
                    )
            ]
        }
    }
}