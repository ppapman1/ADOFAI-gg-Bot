const api = require('../api');
const lang = require("../lang");

module.exports = {
    info: {
        name: 'level',
        description: 'ID로 레벨을 찾아 표시합니다. // Find and display the level with your ID.',
        options: [
            {
                name: 'id',
                description: '정보를 볼 레벨 ID입니다. // This is the level ID to view information.',
                type: 'NUMBER',
                required: true
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const levelID = interaction.options.getNumber('id');
        const level = await api.getLevel(levelID);

        if(!level) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'LEVEL_NOT_FOUND'));

        return interaction.editReply(api.getLevelInfoMessage(level, interaction.dbUser.lang));
    }
}