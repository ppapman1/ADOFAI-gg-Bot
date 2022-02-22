const { ApplicationCommandOptionType: Options } = require('discord.js');

const { getCommandDescription } = require('../../lang');
const utils = require('../../utils');

module.exports = {
    allowDM: true,
    info: {
        name: 'admin',
        description: getCommandDescription('ADMIN_DESCRIPTION'),
        options: [
            {
                name: 'clearcommand',
                description: getCommandDescription('ADMIN_CLEARCOMMAND_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'trackerror',
                description: getCommandDescription('ADMIN_TRACKERROR_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'forcedmcommand',
                description: getCommandDescription('ADMIN_FORCEDMCOMMAND_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'ephemeralonly',
                description: getCommandDescription('ADMIN_EPHEMERALONLY_DESCRIPTION'),
                type: Options.Subcommand
            }
        ]
    },
    checkPermission: utils.teamOwnerOnlyHandler,
    handler: utils.subCommandHandler('admin')
}