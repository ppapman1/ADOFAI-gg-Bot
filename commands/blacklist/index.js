const main = require("../../main");
const utils = require('../../utils');
const { getCommandDescription } = require('../../lang');

module.exports = {
    info: {
        name: 'blacklist',
        description: getCommandDescription('BLACKLIST_DESCRIPTION'),
        options: [
            {
                name: 'add',
                description: getCommandDescription('BLACKLIST_ADD_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'user',
                        description: getCommandDescription('BLACKLIST_ADD_USER_DESCRIPTION'),
                        type: 'USER',
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: getCommandDescription('BLACKLIST_REMOVE_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'user',
                        description: getCommandDescription('BLACKLIST_REMOVE_USER_DESCRIPTION'),
                        type: 'USER',
                        required: true
                    }
                ]
            }
        ]
    },
    checkPermission: utils.teamOwnerOnlyHandler,
    handler: utils.subCommandHandler('blacklist')
}