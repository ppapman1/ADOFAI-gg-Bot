const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');

const MusicQueue = require('../../schemas/musicQueue');

module.exports = {
    group: 'music',
    info: {
        defaultPermission: false,
        name: 'clear',
        description: getCommandDescription('CLEAR_DESCRIPTION')
    },
    handler: async interaction => {
        const firstMusic = await MusicQueue.findOne({
            guild: interaction.guild.id
        });
        if(!firstMusic) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        await MusicQueue.deleteMany({
            guild: interaction.guild.id,
            id: {
                $ne: firstMusic.id
            }
        });

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_CLEARED'));
    }
}