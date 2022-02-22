const { ActionRow , ButtonComponent, ButtonStyle, Embed, SelectMenuComponent, SelectMenuOption } = require('discord.js');
const axios = require('axios');
const crpyto = require('crypto');
const Url = require('url');

const setting = require('./setting.json');
const Server = require('./server.json');
const lang = require('./lang');

const ADOFAIArtist = require('./schemas/ADOFAIArtist');

const artistStatus = [
    {
        ko: '대기 중',
        en: 'Pending',
        color: 0xffffff,
        emoji: '⚫'
    },
    {
        ko: '허락',
        en: 'Allowed',
        color: 0x2bb127,
        emoji: '🟢'
    },
    {
        ko: '대부분 거절',
        en: 'Mostly Declined',
        color: 0xdc9c41,
        emoji: '🟠'
    },
    {
        ko: '거절',
        en: 'Declined',
        color: 0xb13327,
        emoji: '🔴'
    },
    {
        ko: '대부분 허락',
        en: 'Mostly Allowed',
        color: 0x73bb17,
        emoji: '🟢'
    }
]

module.exports.setup = () => {
    setInterval(async () => {
        await module.exports.updateArtists();
    }, 1000 * 60 * 60);
}

module.exports.updateArtists = async (force = false) => {
    const data = await axios.get(setting.ADOFAI_ARTIST_DUMP);

    const checkFirst = await ADOFAIArtist.findOne();
    const hash = crpyto.createHash('md5').update(JSON.stringify(data.data)).digest('hex');

    if(!force && checkFirst && checkFirst.hash === hash) {
        console.log('[adofaiAPI] hash not changed, skip update');
        return;
    }
    
    for(let a of data.data) {
        const links = [];
        if(a.link_1) links.push(a.link_1);
        if(a.link_2) links.push(a.link_2);

        await ADOFAIArtist.updateOne({
            id: a.id
        }, {
            hash,
            name: a.name,
            evidences: JSON.parse(a.evidence_url),
            links,
            status: a.status_new,
            ko_desc: a.adofai_artist_disclaimers.find(a => a.lang === 'ko')?.text,
            en_desc: a.adofai_artist_disclaimers.find(a => a.lang === 'en')?.text
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        });
    }

    await ADOFAIArtist.deleteMany({
        hash: {
            $ne: hash
        }
    });

    console.log('[adofaiAPI] updated artists');
}

module.exports.getSearchList = (search, page, totalPage, userid, language = 'en') => {
    if(!userid) return null;

    const selectOptions = [];

    if(!search.length) selectOptions.push(
        new SelectMenuOption()
            .setLabel('how did you found this?')
            .setValue('fake')
    );
    else for(let l of search) selectOptions.push(
        new SelectMenuOption()
            .setLabel(l.name)
            .setDescription(artistStatus[l.status][language])
            .setValue(`showartist_${userid}_${l.id}`)
            .setEmoji({
                name: artistStatus[l.status].emoji
            })
    );

    const components = [
        new ActionRow()
            .addComponents(
                new SelectMenuComponent()
                    .setCustomId(`showartist`)
                    .setPlaceholder(lang.langByLangName(language, 'SELECT_ARTIST_SELECT_MENU'))
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
                    .setDisabled(page >= totalPage)
            )
    ]

    return {
        content: lang.langByLangName(language, 'SELECT_ARTIST_MESSAGE'),
        components
    }
}

module.exports.getArtistInfoMessage = (artist, language = 'en') => {
    const artistLinkButtons = [];
    const evidenceButtons = [];

    for(let l of artist.links.slice(0, 5)) {
        const url = Url.parse(l);

        let linktype;

        if(url.hostname.endsWith('youtube.com') || url.hostname.endsWith('youtu.be')) linktype = 'YouTube';
        else if(url.hostname.endsWith('soundcloud.com')) linktype = 'SoundCloud';
        else if(url.hostname.endsWith('bandcamp.com')) linktype = 'Bandcamp';
        else if(url.hostname.endsWith('spotify.com')) linktype = 'Spotify';
        else if(url.hostname.endsWith('twitter.com')) linktype = 'Twitter';
        else linktype = 'Other';

        artistLinkButtons.push(
            new ButtonComponent()
                .setLabel(linktype)
                .setStyle(ButtonStyle.Link)
                .setURL(l)
                .setEmoji(linktype === 'Other' ? {
                    name: '🔗'
                } : {
                    id: Server.emoji[linktype.toLowerCase()]
                })
        );
    }

    for(let i in artist.evidences?.slice(0, 5)) {
        const e = artist.evidences[i];

        const isImage = e.endsWith('.jpg') || e.endsWith('.png') || e.endsWith('.gif') || e.endsWith('.jpeg');

        if(isImage) evidenceButtons.push(
            new ButtonComponent()
                .setCustomId(`evidence_${artist.id}_${i}`)
                .setLabel(`${lang.langByLangName(language, 'EVIDENCE')} ${Number(i) + 1}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji({
                    name: '🖼️'
                })
        );
        else {
            const url = Url.parse(e);
            const isDiscord = url.hostname.endsWith('discord.com') || url.hostname.endsWith('discordapp.com');

            evidenceButtons.push(
                new ButtonComponent()
                    .setLabel(`${lang.langByLangName(language, 'EVIDENCE')} ${Number(i) + 1}`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(e)
                    .setEmoji(isDiscord ? {
                        id: Server.emoji.discord
                    } : {
                        name: '🔗'
                    })
            );
        }
    }

    const components = [];
    if(evidenceButtons.length) components.push(
        new ActionRow()
            .addComponents(...evidenceButtons)
    );
    if(artistLinkButtons.length) components.push(
        new ActionRow()
            .addComponents(...artistLinkButtons)
    );

    return {
        content: null,
        embeds: [
            new Embed()
                .setColor(artistStatus[artist.status].color)
                .setAuthor({
                    name: artistStatus[artist.status][language]
                })
                .setTitle(artist.name)
                .setURL(Url.resolve(setting.WEBSITE_7BG, `verified-artists/adofai/artist/${artist.id}`))
                .setDescription(artist[`${language}_desc`] || artist.en_desc || 'No Description')
                .setFooter({
                    text: `ID : ${artist.id}`
                })
        ],
        components
    }
}