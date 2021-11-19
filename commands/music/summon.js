const lang = require('../../lang');
const music = require('../../music');

module.exports = {
    group: 'music',
    info: {
        name: 'summon',
        description: '봇을 음성 채널에 접속하게 합니다. // Let the bot access the voice channel.'
    },
    handler: async interaction => {
        const voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NEED_TO_CONNECTED_VOICE_CHANNEL'));

        await music.connect(voiceChannel, interaction.channel);
        await music.start(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_SUMMON_SUCCESS'));
    }
}