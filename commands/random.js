const lang = require('../lang');
const { getCommandDescription } = require('../lang');
const api = require("../api");
const utils = require('../utils');

module.exports = {
    allowDM: true,
    info: {
        name: 'random',
        description: getCommandDescription('RANDOM_DESCRIPTION'),
        options: [
            {
                name: 'query',
                description: getCommandDescription('SEARCH_LEVEL_QUERY_DESCRIPTION'),
                type: 'STRING',
                autocomplete: true
            },
            {
                name: 'mindifficulty',
                description: getCommandDescription('SEARCH_LEVEL_MINDIFFICULTY_DESCRIPTION'),
                type: 'NUMBER',
                min_value: 0,
                max_value: 22
            },
            {
                name: 'maxdifficulty',
                description: getCommandDescription('SEARCH_LEVEL_MAXDIFFICULTY_DESCRIPTION'),
                type: 'NUMBER',
                min_value: 0,
                max_value: 22
            },
            {
                name: 'minbpm',
                description: getCommandDescription('SEARCH_LEVEL_MINBPM_DESCRIPTION'),
                type: 'NUMBER',
                min_value: 0
            },
            {
                name: 'maxbpm',
                description: getCommandDescription('SEARCH_LEVEL_MAXBPM_DESCRIPTION'),
                type: 'NUMBER',
                min_value: 0
            },
            {
                name: 'mintiles',
                description: getCommandDescription('SEARCH_LEVEL_MINTILES_DESCRIPTION'),
                type: 'INTEGER',
                min_value: 0
            },
            {
                name: 'maxtiles',
                description: getCommandDescription('SEARCH_LEVEL_MAXTILES_DESCRIPTION'),
                type: 'INTEGER',
                min_value: 0
            },
            {
                name: 'shownotverified',
                description: getCommandDescription('SEARCH_LEVEL_SHOWNOTVERIFIED_DESCRIPTION'),
                type: 'BOOLEAN'
            },
            // {
            //     name: 'showcensored',
            //     description: getCommandDescription('SEARCH_LEVEL_SHOWCENSORED_DESCRIPTION'),
            //     type: 'BOOLEAN'
            // }
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
            minTiles: options.getInteger('mintiles'),
            maxTiles: options.getInteger('maxtiles'),
            showNotVerified: options.getBoolean('shownotverified'),
            // showCensored: options.getBoolean('showcensored'),
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
            filter: i => i.customId === 'reroll' && i.user.id === interaction.user.id,
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
    },
    autoCompleteHandler: utils.levelAutoCompleteHandler
}