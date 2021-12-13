const ytdl = require("ytdl-core");

const lang = require('../lang');
const music = require('../music');

module.exports = async interaction => {
    await interaction.deferReply();

    const params = interaction.customId.split('_');
    if(params.length < 2) return interaction.editReply('invalid button');

    const videoID = params.slice(1).join('_');

    if(!interaction.guild.me.voice.channel) {
        const voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NEED_TO_CONNECTED_VOICE_CHANNEL'));

        await music.connect(voiceChannel, interaction.channel);
        await music.start(interaction.guild);
    }
    
    try {
        const videoInfo = await ytdl.getInfo(videoID);

        await music.addQueue(interaction.guild, interaction.user, videoID);

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_ADDED')
            .replace('{title}', videoInfo.videoDetails.title)
        );
    } catch(e) {}
}