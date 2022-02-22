const { ApplicationCommandOptionType: Options } = require('discord.js');

const utils = require('../../utils');
const { getCommandDescription } = require('../../lang');

module.exports = {
    allowDM: true,
    info: {
        name: 'blacklist',
        description: getCommandDescription('BLACKLIST_DESCRIPTION'),
        options: [
            {
                name: 'add',
                description: getCommandDescription('BLACKLIST_ADD_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'user',
                        description: getCommandDescription('BLACKLIST_ADD_USER_DESCRIPTION'),
                        type: Options.User,
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: getCommandDescription('BLACKLIST_REMOVE_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'user',
                        description: getCommandDescription('BLACKLIST_REMOVE_USER_DESCRIPTION'),
                        type: Options.User,
                        required: true
                    }
                ]
            }
        ]
    },
    checkPermission: utils.teamOwnerOnlyHandler,
    handler: utils.subCommandHandler('blacklist')
}