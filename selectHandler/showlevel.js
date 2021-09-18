const { MessageEmbed , MessageActionRow , MessageButton } = require('discord.js');

const setting = require('../setting.json');

const main = require('../main');
const utils = require('../utils');
const lang = require('../lang');
const api = require('../api');

const Server = require('../server.json');

module.exports = async interaction => {
    const params = interaction.values[0].split('_');
    if(params.length != 3) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
        components: []
    });
    if(params[1] != interaction.user.id) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'SELF_MESSAGE_ONLY'),
        ephemeral: true
    });

    const level = await api.getLevel(params[2]);
    if(!level) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'LEVEL_NOT_FOUND'),
        components: []
    });

    const title = `${level.artists.join(' & ')} - ${level.title}`;

    if(level.workshop) level.workshop = level.workshop.trim();
    if(level.download) level.download = level.download.trim();
    else return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'DOWNLOAD_LINK_MISSING'),
        ephemeral: true
    });

    const levelEmoji = main.Server.emoji[level.difficulty.toString()];
    if(!levelEmoji) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'UNSUPPORTED_LEVEL'),
        ephemeral: true
    });

    return interaction.update({
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
                        .setLabel(lang.langByLangName(interaction.dbUser.lang, 'DOWNLOAD'))
                        .setStyle('LINK')
                        .setURL(level.download)
                        .setEmoji(Server.emoji.download),
                    new MessageButton()
                        .setLabel(lang.langByLangName(interaction.dbUser.lang, 'WORKSHOP'))
                        .setStyle('LINK')
                        .setURL(level.workshop || level.download)
                        .setEmoji(Server.emoji.steam)
                        .setDisabled(!level.workshop),
                    new MessageButton()
                        .setLabel(lang.langByLangName(interaction.dbUser.lang, 'WATCH_VIDEO'))
                        .setStyle('LINK')
                        .setURL(level.video)
                        .setEmoji(Server.emoji.youtube)
                )
        ]
    });
}