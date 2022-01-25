const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const music = require('../../music');

module.exports = {
    group: 'music',
    info: {
        name: 'stop',
        description: getCommandDescription('STOP_DESCRIPTION'),
    },
    handler: async interaction => {
        const player = music.getPlayer(interaction.guild);
        if(!player) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        music.disconnect(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_STOPPED'));
    }
}