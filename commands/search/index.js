const { ApplicationCommandOptionType: Options } = require('discord.js');

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
                type: Options.Subcommand,
                options: [
                    {
                        name: 'query',
                        description: getCommandDescription('SEARCH_LEVEL_QUERY_DESCRIPTION'),
                        type: Options.String,
                        autocomplete: true
                    },
                    {
                        name: 'mindifficulty',
                        description: getCommandDescription('SEARCH_LEVEL_MINDIFFICULTY_DESCRIPTION'),
                        type: Options.Number,
                        min_value: 0,
                        max_value: 22
                    },
                    {
                        name: 'maxdifficulty',
                        description: getCommandDescription('SEARCH_LEVEL_MAXDIFFICULTY_DESCRIPTION'),
                        type: Options.Number,
                        min_value: 0,
                        max_value: 22
                    },
                    {
                        name: 'minbpm',
                        description: getCommandDescription('SEARCH_LEVEL_MINBPM_DESCRIPTION'),
                        type: Options.Number,
                        min_value: 0
                    },
                    {
                        name: 'maxbpm',
                        description: getCommandDescription('SEARCH_LEVEL_MAXBPM_DESCRIPTION'),
                        type: Options.Number,
                        min_value: 0
                    },
                    {
                        name: 'mintiles',
                        description: getCommandDescription('SEARCH_LEVEL_MINTILES_DESCRIPTION'),
                        type: Options.Integer,
                        min_value: 0
                    },
                    {
                        name: 'maxtiles',
                        description: getCommandDescription('SEARCH_LEVEL_MAXTILES_DESCRIPTION'),
                        type: Options.Integer,
                        min_value: 0
                    },
                    {
                        name: 'shownotverified',
                        description: getCommandDescription('SEARCH_LEVEL_SHOWNOTVERIFIED_DESCRIPTION'),
                        type: Options.Boolean
                    },
                    // {
                    //     name: 'showcensored',
                    //     description: getCommandDescription('SEARCH_LEVEL_SHOWCENSORED_DESCRIPTION'),
                    //     type: Options.Boolean
                    // }
                ]
            },
            {
                name: 'artist',
                description: getCommandDescription('SEARCH_ARTIST_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('SEARCH_ARTIST_NAME_DESCRIPTION'),
                        type: Options.String,
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