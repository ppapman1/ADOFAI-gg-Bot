const lang = require('../lang');
const { getCommandDescription } = require('../lang');

const User = require('../schemas/user');

module.exports = {
    info: {
        name: 'language',
        description: getCommandDescription('LANGUAGE_DESCRIPTION'),
        options: [
            {
                name: 'lang',
                description: getCommandDescription('LANGUAGE_LANG_DESCRIPTION'),
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