const main = require("../../main");
const utils = require('../../utils');
const { getCommandDescription, langByLangName } = require('../../lang');

module.exports = {
    info: {
        name: 'features',
        description: getCommandDescription('FEATURES_DESCRIPTION'),
        options: [
            {
                name: 'enable',
                description: getCommandDescription('FEATURES_ENABLE_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('FEATURES_ENABLE_NAME_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'disable',
                description: getCommandDescription('FEATURES_DISABLE_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('FEATURES_ENABLE_NAME_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'list',
                description: getCommandDescription('FEATURES_LIST_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'permission',
                description: getCommandDescription('FEATURES_PERMISSION_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'command',
                        description: getCommandDescription('FEATURES_PERMISSION_COMMAND_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            }
        ]
    },
    checkPermission: interaction => utils.permissionChecker(() =>
            main.getTeamOwner() === interaction.user.id
            || interaction.dbUser.dokdoPermission,
        langByLangName(interaction.dbUser.lang, 'DOKDO_PERMISSION')
    )(interaction),
    handler: utils.subCommandHandler('features'),
    autoCompleteHandler: utils.autoCompleteHandler('features')
}