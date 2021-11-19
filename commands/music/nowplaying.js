const { MessageEmbed , MessageActionRow , MessageButton } = require('discord.js');

const lang = require('../../lang');
const utils = require('../../utils');
const Server = require('../../server.json');

const MusicQueue = require('../../schemas/musicQueue');

module.exports = {
    group: 'music',
    info: {
        name: 'nowplaying',
        description: '현재 재생중인 곡 정보를 보여줍니다. // Shows the current song playing.'
    },
    handler: async interaction => {
        const nowPlaying = await MusicQueue.findOne({
            guild: interaction.guild.id
        });
        if(!nowPlaying) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_NOT_FOUND'));

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#349eeb')
                    .setTitle(nowPlaying.title)
                    .setDescription(`Requested by ${interaction.client.users.cache.get(nowPlaying.createdUser)?.username || 'Unknown User'}`)
                    .setImage(`https://i.ytimg.com/vi/${nowPlaying.url}/original.jpg`)
            ],
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'WATCH_VIDEO'))
                            .setStyle('LINK')
                            .setURL(`https://youtu.be/${nowPlaying.url}`)
                            .setEmoji(Server.emoji.youtube)
                    )
            ]
        });
    }
}