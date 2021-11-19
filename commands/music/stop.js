const lang = require('../../lang');
const music = require('../../music');

module.exports = {
    group: 'music',
    info: {
        defaultPermission: false,
        name: 'stop',
        description: '봇을 음성 채널에서 내보냅니다. // Leave the bot from the voice channel.'
    },
    handler: async interaction => {
        const player = music.getPlayer(interaction.guild);
        if(!player) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        music.disconnect(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_STOPPED'));
    }
}