const api = require('../api');
const { getCommandDescription } = require('../lang');

module.exports = {
    allowDM: true,
    info: {
        name: 'ranking',
        description: getCommandDescription('RANKING_DESCRIPTION'),
        options: [
            {
                name: 'page',
                description: getCommandDescription('RANKING_PAGE_DESCRIPTION'),
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