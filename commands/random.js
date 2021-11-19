const lang = require('../lang');
const api = require("../api");

module.exports = {
    info: {
        name: 'random',
        description: '조건에 맞는 랜덤한 레벨을 골라 추천합니다. // I recommend you to choose a random level that meets the conditions.',
        options: [
            {
                name: 'query',
                description: '검색할 레벨의 이름, 제작자, 작곡가 등을 입력하세요. // Enter the name, or creator, or artist.',
                type: 'STRING'
            },
            {
                name: 'mindifficulty',
                description: '최소 레벨을 입력합니다. // Enter the minimum level.',
                type: 'NUMBER'
            },
            {
                name: 'maxdifficulty',
                description: '최대 레벨을 입력합니다. // Enter the maximum level.',
                type: 'NUMBER'
            },
            {
                name: 'minbpm',
                description: '최소 BPM을 입력합니다. // Enter the minimum BPM.',
                type: 'NUMBER'
            },
            {
                name: 'maxbpm',
                description: '최대 BPM을 입력합니다. // Enter the maximum BPM.',
                type: 'NUMBER'
            },
            {
                name: 'mintiles',
                description: '최소 타일 수를 입력합니다. // Enter the minimum number of tiles.',
                type: 'NUMBER'
            },
            {
                name: 'maxtiles',
                description: '최대 타일 수를 입력합니다. // Enter the maximum number of tiles.',
                type: 'NUMBER'
            },
            {
                name: 'shownotverified',
                description: '책정되지 않은 레벨(0레벨)을 포함해서 검색합니다. // Search including an undetermined level (level 0).',
                type: 'BOOLEAN'
            },
            {
                name: 'showcensored',
                description: '검열된 레벨(-2레벨)을 포함해서 검색합니다. // Search, including censored levels (-2).',
                type: 'BOOLEAN'
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const { options } = interaction;

        const searchQuery = {
            query: options.getString('query'),
            minDifficulty: options.getNumber('mindifficulty'),
            maxDifficulty: options.getNumber('maxdifficulty'),
            minBpm: options.getNumber('minbpm'),
            maxBpm: options.getNumber('maxbpm'),
            minTiles: options.getNumber('mintiles'),
            maxTiles: options.getNumber('maxtiles'),
            showNotVerified: options.getBoolean('shownotverified'),
            showCensored: options.getBoolean('showcensored'),
            sort: 'RANDOM',
            amount: 1
        };

        let msg;

        const pickLevel = async () => {
            const search = await api.searchLevel(searchQuery);

            if(!search.length) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'SEARCH_NOT_FOUND'));

            msg = await interaction.editReply(api.getLevelInfoMessage(search[0], interaction.dbUser.lang, true, interaction.dbGuild.features?.includes('music')));
        }

        await pickLevel();

        const rerollCollector = msg.createMessageComponentCollector({
            filter: i => i.customId == 'reroll' && i.user.id == interaction.user.id,
            time: 30000
        });

        rerollCollector.on('collect', async i => {
            await pickLevel();
            await i.deferUpdate();
            return rerollCollector.resetTimer();
        });

        rerollCollector.on('end', async () => {
            msg.components[1].components[0].setDisabled();
            await interaction.editReply({
                components: msg.components
            });
        });
    }
}