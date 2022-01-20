const permission = require('../../permissions');
const utils = require('../../utils');
const { getCommandDescription } = require('../../lang');

const typeChoices = require('./templateType');

module.exports = {
    private: true,
    permissions: permission.staffOnly,
    info: {
        defaultPermission: false,
        name: 'reasontemplate',
        description: getCommandDescription('REASONTEMPLATE_DESCRIPTION'),
        options: [
            {
                name: 'create',
                description: getCommandDescription('REASONTEMPLATE_CREATE_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'type',
                        description: getCommandDescription('REASONTEMPLATE_CREATE_TYPE_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        choices: typeChoices
                    },
                    {
                        name: 'reason',
                        description: getCommandDescription('REASONTEMPLATE_CREATE_REASON_DESCRIPTION'),
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'delete',
                description: getCommandDescription('REASONTEMPLATE_DELETE_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'type',
                        description: getCommandDescription('REASONTEMPLATE_DELETE_TYPE_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        choices: typeChoices
                    },
                    {
                        name: 'reason',
                        description: getCommandDescription('REASONTEMPLATE_DELETE_REASON_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            }
        ]
    },
    handler: utils.subCommandHandler('reasontemplate'),
    autoCompleteHandler: utils.autoCompleteHandler('reasontemplate')
}