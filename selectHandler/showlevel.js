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
        content: lang.langByChannel(interaction.channel, 'ERROR'),
        components: []
    });
    if(params[1] != interaction.user.id) return interaction.reply({
        content: lang.langByChannel(interaction.channel, 'SELF_MESSAGE_ONLY'),
        ephemeral: true
    });

    const level = await api.getLevel(params[2]);
    if(!level) return interaction.update({
        content: lang.langByChannel(interaction.channel, 'LEVEL_NOT_FOUND'),
        components: []
    });

    const title = `${level.artists.join(' & ')} - ${level.title}`;

    return interaction.update({
        embeds: [
            new MessageEmbed()
                .setColor('#349eeb')
                .setTitle(title)
                .setURL(`${setting.MAIN_SITE}/levels/${level.id}`)
                .setDescription(`Level by ${level.creators.join(' & ')}`)
                .addField('Lv.', main.Server.emoji[level.difficulty.toString()].toString(), true)
                .addField('BPM', level.minBpm.toString(), true)
                .addField('Tiles', level.tiles.toString(), true)
                .addField('Description', level.description || `There's no description for this level.`)
                .setImage(`https://i.ytimg.com/vi/${utils.parseYouTubeLink(level.video).videoCode}/maxresdefault.jpg`)
        ],
        content: '\u200B',
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel(lang.langByChannel(interaction.channel, 'DOWNLOAD'))
                        .setStyle('LINK')
                        .setURL(level.download)
                        .setEmoji(Server.emoji.download),
                    new MessageButton()
                        .setLabel(lang.langByChannel(interaction.channel, 'WORKSHOP'))
                        .setStyle('LINK')
                        .setURL(level.workshop || level.download)
                        .setEmoji(Server.emoji.steam)
                        .setDisabled(!level.workshop),
                    new MessageButton()
                        .setLabel(lang.langByChannel(interaction.channel, 'WATCH_VIDEO'))
                        .setStyle('LINK')
                        .setURL(level.video)
                        .setEmoji(Server.emoji.youtube)
                )
        ]
    });
}