const { MessageEmbed , MessageActionRow , MessageButton } = require('discord.js');
const ytdl = require('ytdl-core');

const lang = require('../../lang');
const music = require('../../music');
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
        const resource = music.getResource(interaction.guild);

        if(!nowPlaying || !resource) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_NOT_FOUND'));

        const info = await ytdl.getInfo(nowPlaying.url);

        const progressBarSize = 16;
        const percentage = resource.playbackDuration / (info.videoDetails.lengthSeconds * 1000);
        const progress = Math.round(progressBarSize * percentage);
        const emptyProgress = progressBarSize - progress;
        const progressBar = `[${'▇'.repeat(progress)}${'—'.repeat(emptyProgress)}]`;

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#349eeb')
                    .setAuthor({
                        name: info.videoDetails.author.name,
                        iconURL: info.videoDetails.author.thumbnails[0].url
                    })
                    .setTitle(nowPlaying.title)
                    .setDescription(`${info.videoDetails.description.substring(0, 300)}${info.videoDetails.description.length > 2000 ? '...' : ''}\n\n${progressBar} ${utils.msToTimeNumber(resource.playbackDuration)} / ${utils.msToTimeNumber(info.videoDetails.lengthSeconds * 1000)}`)
                    .setImage(`https://i.ytimg.com/vi/${nowPlaying.url}/original.jpg`)
                    .setFooter({
                        text: `Requested by ${interaction.client.users.cache.get(nowPlaying.createdUser)?.username || 'Unknown User'}`,
                        iconURL: interaction.client.users.cache.get(nowPlaying.createdUser)?.avatarURL()
                    })
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