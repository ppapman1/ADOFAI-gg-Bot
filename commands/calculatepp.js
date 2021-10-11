const api = require('../api');
const lang = require("../lang");

module.exports = {
    info: {
        name: 'calculatepp',
        description: 'PP를 계산합니다. // Calculate PP',
        options: [
            {
                name: 'id',
                description: '레벨 ID입니다. // This is the level ID.',
                type: 'NUMBER',
                required: true
            },
            {
                name: 'accuracy',
                description: '정확도입니다. // This is accuracy.',
                type: 'NUMBER'
            },
            {
                name: 'pitch',
                description: '피치입니다. // This is pitch.',
                type: 'NUMBER'
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
