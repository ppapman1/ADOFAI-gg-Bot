const lang = require('../lang');

const User = require('../schemas/user');

module.exports = {
    info: {
        name: 'language',
        description: '봇의 언어를 설정합니다 // Set bot\'s language.',
        options: [
            {
                name: 'lang',
                description: '원하는 언어를 선택합니다. // Select language you want.',
                type: 'STRING',
                required: true,
                choices: lang.getLangChoices()
            }
        ]
    },
    handler: async interaction => {
        const langName = interaction.options.getString('lang');

        await User.updateOne({
            id: interaction.user.id
        }, {
            lang: langName
        });

        return interaction.reply({
            content: lang.langByLangName(langName, 'LANGUAGE_CHANGED'),
            ephemeral: true
        });
    }
}