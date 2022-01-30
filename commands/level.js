const api = require('../api');
const lang = require('../lang');
const { getCommandDescription } = require('../lang');

module.exports = {
    info: {
        name: 'level',
        description: getCommandDescription('LEVEL_DESCRIPTION'),
        options: [
            {
                name: 'id',
                description: getCommandDescription('LEVEL_ID_DESCRIPTION'),
                type: 'INTEGER',
                required: true,
                min_value: 1
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const levelID = interaction.options.getInteger('id');
        const level = await api.getLevel(levelID);

        if(!level) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'LEVEL_NOT_FOUND'));
        if(level.error) return interaction.editReply(level.discordMessage);

        return interaction.editReply(api.getLevelInfoMessage(level, interaction.dbUser.lang, false, interaction.dbGuild.features?.includes('music')));
    }
}