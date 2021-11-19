const lang = require('../../lang');
const music = require('../../music');

module.exports = {
    group: 'music',
    info: {
        defaultPermission: false,
        name: 'resume',
        description: '일시정지된 음악을 다시 재생합니다. // Play the paused music again.'
    },
    handler: async interaction => {
        const player = music.getPlayer(interaction.guild);
        if(!player) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        if(player.state.status !== 'paused') return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_ALREADY_PLAYING'));

        music.resume(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_RESUMED'));
    }
}