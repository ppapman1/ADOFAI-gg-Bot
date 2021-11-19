const lang = require('../../lang');

const MusicQueue = require('../../schemas/musicQueue');

module.exports = {
    group: 'music',
    info: {
        name: 'clear',
        description: '음악 대기열을 비웁니다. // Clear the music queue.'
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