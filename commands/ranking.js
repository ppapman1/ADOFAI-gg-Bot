const api = require('../api');

module.exports = {
    info: {
        name: 'ranking',
        description: 'PP 랭킹을 표시합니다. // Show PP ranking.',
        options: [
            {
                name: 'page',
                description: '볼 랭킹의 페이지입니다. // This is the ranking page.',
                type: 'NUMBER'
            }
        ]
    },
    handler: async interaction => {
        const page = interaction.options.getNumber('page');
        const ranking = await api.getPPEmbedField(interaction, page ? (page - 1) * 5 : 0);
        return interaction.reply(ranking.reply);
    }
}