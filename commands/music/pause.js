const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const music = require('../../music');

module.exports = {
    group: 'music',
    info: {
        name: 'pause',
        description: getCommandDescription('PAUSE_DESCRIPTION')
    },
    handler: async interaction => {
        const player = music.getPlayer(interaction.guild);
        if(!player) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        if(player.state.status === 'paused') return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_ALREADY_PAUSED'));

        music.pause(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_PAUSED'));
    }
}