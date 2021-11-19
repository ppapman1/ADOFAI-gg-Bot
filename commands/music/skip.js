const lang = require('../../lang');
const music = require('../../music');

const MusicQueue = require('../../schemas/musicQueue');

module.exports = {
    group: 'music',
    info: {
        name: 'skip',
        description: '음악을 건너뜁니다. // Skip the music.'
    },
    handler: async interaction => {
        const player = music.getPlayer(interaction.guild);
        if(!player || player.state.status === 'idle') return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        const nowPlaying = await MusicQueue.findOne({
            guild: interaction.guild.id
        });

        music.skip(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_SKIPPED')
            .replace('{title}', nowPlaying.title)
        );
    }
}