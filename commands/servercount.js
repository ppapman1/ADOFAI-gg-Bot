const lang = require('../lang');

module.exports = {
    info: {
        name: 'servercount',
        description: lang.getCommandDescription('SERVERCOUNT_DESCRIPTION')
    },
    handler: async interaction => {
        return interaction.reply(lang.langByLangName(
            interaction.dbUser.lang, 'SERVERCOUNT')
            .replace('{servercount}', interaction.client.guilds.cache.size)
        );
    }
}