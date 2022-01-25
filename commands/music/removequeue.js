const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');

const MusicQueue = require('../../schemas/musicQueue');
const main = require("../../main");

module.exports = {
    group: 'music',
    info: {
        name: 'removequeue',
        description: getCommandDescription('REMOVEQUEUE_DESCRIPTION'),
        options: [
            {
                name: 'number',
                description: '대기열 번호입니다. // Enter the queue number.',
                type: 'INTEGER',
                required: true,
                min_value: 1
            }
        ]
    },
    handler: async interaction => {
        const queueNumber = interaction.options.getInteger('number');

        const target = await MusicQueue.findOne({
            guild: interaction.guild.id
        }).skip(queueNumber);

        if(!target) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_NOT_FOUND'));
        if(target.createdUser !== interaction.user.id && !main.getOwnerID().includes(interaction.user.id))
            return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'SKIP_SELF_MUSIC_ONLY'));

        await MusicQueue.deleteOne({
            id: target.id
        });

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_REMOVED')
            .replace('{title}', target.title)
        );
    }
}