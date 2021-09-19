const lang = require('../lang');

module.exports = {
    info: {
        name: 'servercount',
        description: '현재 봇이 있는 서버 갯수를 보여줍니다. // It shows the number of servers that currently have bots.'
    },
    handler: async interaction => {
        return interaction.reply(lang.langByLangName(
            interaction.dbUser.lang, 'SERVERCOUNT')
            .replace('{servercount}', interaction.client.guilds.cache.size)
        );
    }
}