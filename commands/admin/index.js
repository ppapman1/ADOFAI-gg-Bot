const { getCommandDescription } = require('../../lang');
const main = require('../../main');
const utils = require('../../utils');

module.exports = {
    info: {
        name: 'admin',
        description: getCommandDescription('ADMIN_DESCRIPTION'),
        options: [
            {
                name: 'clearcommand',
                description: getCommandDescription('ADMIN_CLEARCOMMAND_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'trackerror',
                description: getCommandDescription('ADMIN_TRACKERROR_DESCRIPTION'),
                type: 'SUB_COMMAND'
            }
        ]
    },
    checkPermission: utils.teamOwnerOnlyHandler,
    handler: utils.subCommandHandler('admin')
}