const api = require('../api');

module.exports = {
    info: {
        name: 'ranking',
        description: 'PP 랭킹을 표시합니다. // Show PP ranking.'
    },
    handler: async interaction => {
        const ranking = await api.getPPEmbedField(interaction.user.id, interaction.channel);
        return interaction.reply(ranking.reply);
    }
}