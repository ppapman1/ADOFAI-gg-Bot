const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const music = require('../../music');

module.exports = {
    group: 'music',
    info: {
        name: 'summon',
        description: getCommandDescription('SUMMON_DESCRIPTION')
    },
    handler: async interaction => {
        const voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NEED_TO_CONNECTED_VOICE_CHANNEL'));

        await music.connect(voiceChannel, interaction.channel);
        await music.start(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_SUMMON_SUCCESS'));
    }
}