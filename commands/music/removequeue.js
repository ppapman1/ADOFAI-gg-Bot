const lang = require('../../lang');

const MusicQueue = require('../../schemas/musicQueue');

module.exports = {
    group: 'music',
    info: {
        name: 'removequeue',
        description: '대기열 번호로 음악을 삭제합니다. // Delete the music with the queue number.',
        options: [
            {
                name: 'number',
                description: '대기열 번호입니다. // Enter the queue number.',
                type: 'NUMBER',
                required: true
            }
        ]
    },
    handler: async interaction => {
        const queueNumber = interaction.options.getNumber('number');

        const removed = await MusicQueue.findOneAndRemove({
            guild: interaction.guild.id
        }).skip(queueNumber - 1);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_REMOVED')
            .replace('{title}', removed.title)
        );
    }
}