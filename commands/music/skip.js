const main = require('../../main');
const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const music = require('../../music');

const MusicQueue = require('../../schemas/musicQueue');

module.exports = {
    group: 'music',
    info: {
        name: 'skip',
        description: getCommandDescription('SKIP_DESCRIPTION')
    },
    handler: async interaction => {
        const player = music.getPlayer(interaction.guild);
        if(!player || player.state.status === 'idle') return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_NOT_PLAYING'));

        const nowPlaying = await MusicQueue.findOne({
            guild: interaction.guild.id
        });

        if(nowPlaying.createdUser !== interaction.user.id && !main.getOwnerID().includes(interaction.user.id))
            return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'SKIP_SELF_MUSIC_ONLY'));

        music.skip(interaction.guild);

        return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'MUSIC_SKIPPED')
            .replace('{title}', nowPlaying.title)
        );
    }
}