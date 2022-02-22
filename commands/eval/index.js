const { ApplicationCommandOptionType: Options } = require('discord.js');

const utils = require('../../utils');
const { getCommandDescription } = require('../../lang');

module.exports = {
    group: 'eval',
    info: {
        defaultPermission: false,
        name: 'eval',
        description: getCommandDescription('EVAL_DESCRIPTION'),
        options: [
            {
                name: 'create',
                description: getCommandDescription('EVAL_CREATE_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('EVAL_CREATE_NAME_DESCRIPTION'),
                        type: Options.String,
                        required: true
                    }
                ]
            },
            {
                name: 'info',
                description: getCommandDescription('EVAL_INFO_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('EVAL_CREATE_NAME_DESCRIPTION'),
                        type: Options.String,
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'message',
                description: getCommandDescription('EVAL_MESSAGE_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('EVAL_CREATE_NAME_DESCRIPTION'),
                        type: Options.String,
                        required: true,
                        autocomplete: true
                    },
                    {
                        name: 'message',
                        description: getCommandDescription('EVAL_MESSAGE_MESSAGE_DESCRIPTION'),
                        type: Options.String,
                        required: true
                    },
                    {
                        name: 'buttontext',
                        description: getCommandDescription('EVAL_MESSAGE_BUTTONTEXT_DESCRIPTION'),
                        type: Options.String,
                        required: true
                    },
                    {
                        name: 'buttoncolor',
                        description: getCommandDescription('EVAL_MESSAGE_BUTTONCOLOR_DESCRIPTION'),
                        type: Options.String,
                        required: true,
                        choices: [
                            {
                                name: getCommandDescription('EVAL_MESSAGE_BUTTONCOLOR_CHOICES_PRIMARY'),
                                value: 'PRIMARY'
                            },
                            {
                                name: getCommandDescription('EVAL_MESSAGE_BUTTONCOLOR_CHOICES_SECONDARY'),
                                value: 'SECONDARY'
                            },
                            {
                                name: getCommandDescription('EVAL_MESSAGE_BUTTONCOLOR_CHOICES_SUCCESS'),
                                value: 'SUCCESS'
                            },
                            {
                                name: getCommandDescription('EVAL_MESSAGE_BUTTONCOLOR_CHOICES_DANGER'),
                                value: 'DANGER'
                            }
                        ]
                    },
                    {
                        name: 'params',
                        description: getCommandDescription('EVAL_MESSAGE_PARAMS_DESCRIPTION'),
                        type: Options.String
                    },
                    {
                        name: 'buttoncolors',
                        description: getCommandDescription('EVAL_MESSAGE_BUTTONCOLORS_DESCRIPTION'),
                        type: Options.String
                    },
                    {
                        name: 'role',
                        description: getCommandDescription('EVAL_MESSAGE_ROLE_DESCRIPTION'),
                        type: Options.Role
                    }
                ]
            }
        ]
    },
    checkPermission: utils.teamOwnerOnlyHandler,
    handler: utils.subCommandHandler('eval'),
    autoCompleteHandler: utils.autoCompleteHandler('eval')
}