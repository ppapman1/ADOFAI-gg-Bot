const utils = require('../../utils');
const { getCommandDescription } = require('../../lang');

module.exports = {
    allowDM: true,
    info: {
        name: 'search',
        description: getCommandDescription('SEARCH_DESCRIPTION'),
        options: [
            {
                name: 'level',
                description: getCommandDescription('SEARCH_LEVEL_DESCRIPTION'),
                type: 'SUB_COMMAND',
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
            {
                name: 'artist',
                description: getCommandDescription('SEARCH_ARTIST_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('SEARCH_ARTIST_NAME_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            }
        ]
    },
    handler: utils.subCommandHandler('search'),
    autoCompleteHandler: utils.autoCompleteHandler('search')
}