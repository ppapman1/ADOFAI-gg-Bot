const lang = require('../../lang');
const music = require('../../music');
const { getCommandDescription } = require('../../lang');

module.exports = {
    group: 'music',
    info: {
        name: 'resume',
        description: getCommandDescription('RESUME_DESCRIPTION')
    },
    handler: async interaction => {
        const player = music.getPlayer(interaction.guild);
        if(!player) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        if(player.state.status !== 'paused') return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_ALREADY_PLAYING'));

        music.resume(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_RESUMED'));
    }
}