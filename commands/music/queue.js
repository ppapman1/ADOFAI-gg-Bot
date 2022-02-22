const { Embed } = require('discord.js');

const MusicQueue = require('../../schemas/musicQueue');
const lang = require("../../lang");
const { getCommandDescription } = require('../../lang');

module.exports = {
    group: 'music',
    info: {
        name: 'queue',
        description: getCommandDescription('QUEUE_DESCRIPTION'),
    },
    handler: async interaction => {
        const queue = await MusicQueue.find({
            guild: interaction.guild.id
        });
        if(!queue.length) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        return interaction.reply({
            embeds: [
                new Embed()
                    .setColor(0x349eeb)
                    .setTitle(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_TITLE'))
                    .setDescription(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_DESCRIPTION')
                        .replace('{servername}', interaction.guild.name)
                    )
                    .addField({
                        name: lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_NOW_PLAYING'),
                        value: `${queue[0].title} (Added by ${interaction.client.users.cache.get(queue[0].createdUser)?.username || 'Unknown User'})`
                    })
                    .addField({
                        name: lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_QUEUE'),
                        value: (queue.length === 1 ? lang.langByLangName(interaction.dbUser.lang, 'MUSIC_QUEUE_NO_QUEUE') : queue.slice(1).map((song, i) => `**${i + 1}.** ${song.title} (Added by ${interaction.client.users.cache.get(song.createdUser)?.username || 'Unknown User'})`).join('\n')).substring(0, 1024)
                    })
            ]
        });
    }
}