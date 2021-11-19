const { MessageActionRow , MessageSelectMenu } = require('discord.js');
const ytdl = require('ytdl-core');

const lang = require('../../lang');
const music = require('../../music');

module.exports = {
    group: 'music',
    info: {
        defaultPermission: false,
        name: 'play',
        description: '대기열에 음악을 추가합니다. // Add music to the queue.',
        options: [
            {
                name: 'music',
                description: '추가할 음악입니다. // This is the music I\'m going to add.',
                type: 'STRING',
                required: true
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const search = interaction.options.getString('music');

        if(!interaction.guild.me.voice.channel) {
            const voiceChannel = interaction.member.voice.channel;
            if(!voiceChannel) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NEED_TO_CONNECTED_VOICE_CHANNEL'));

            await music.connect(voiceChannel, interaction.channel);
            await music.start(interaction.guild);
        }

        try {
            const videoID = ytdl.getVideoID(search);
            const videoInfo = await ytdl.getInfo(videoID);

            await music.addQueue(interaction.guild, interaction.user, videoID);

            return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_ADDED')
                .replace('{title}', videoInfo.videoDetails.title)
            );
        } catch(e) {
            const result = await music.search(search, 25);
            if(!result.length) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'SEARCH_NOT_FOUND'));
            if(result.length === 1) return music.addQueue(interaction.guild, interaction.user, result[0].id);

            const msg = await interaction.editReply({
                content: lang.langByLangName(interaction.dbUser.lang, 'MUSIC_SELECT_MESSAGE'),
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId('select')
                                .setPlaceholder(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_SELECT_PLACEHOLDER'))
                                .addOptions(result.map(video => ({
                                    label: video.title,
                                    description: `by ${video.author.name}`,
                                    value: video.id
                                })))
                        )
                ]
            });

            let i;
            try {
                i = await msg.awaitMessageComponent({
                    filter: i => i.user.id === interaction.user.id,
                    time: 30000
                });
            } catch(e) {
                msg.components[0].components[0].setDisabled();

                return interaction.editReply({
                    components: msg.components
                });
            }

            await music.addQueue(interaction.guild, interaction.user, i.values[0]);

            const videoInfo = await ytdl.getInfo(i.values[0]);

            return interaction.editReply({
                content: lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_ADDED')
                    .replace('{title}', videoInfo.videoDetails.title),
                components: []
            });
        }
    }
}