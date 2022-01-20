const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const utils = require('../../utils');


module.exports = {
    group: 'ticket',
    info: {
        defaultPermission: false,
        name: 'ticket',
        description: getCommandDescription('TICKET_DESCRIPTION'),
        options: [
            {
                name: 'setname',
                description: getCommandDescription('TICKET_SETNAME_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('TICKET_SETNAME_NAME_DESCRIPTION'),
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'open',
                description: getCommandDescription('TICKET_OPEN_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'close',
                description: getCommandDescription('TICKET_CLOSE_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'delete',
                description: getCommandDescription('TICKET_DELETE_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'archive',
                description: getCommandDescription('TICKET_ARCHIVE_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'unarchive',
                description: getCommandDescription('TICKET_UNARCHIVE_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'category',
                description: getCommandDescription('TICKET_CATEGORY_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'type',
                        description: getCommandDescription('TICKET_CATEGORY_TYPE_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        choices: [
                            {
                                name: 'openTicketCategory',
                                value: 'openTicketCategory'
                            },
                            {
                                name: 'closedTicketCategory',
                                value: 'closedTicketCategory'
                            },
                            {
                                name: 'archivedTicketCategory',
                                value: 'archivedTicketCategory'
                            }
                        ]
                    },
                    {
                        name: 'category',
                        description: getCommandDescription('TICKET_CATEGORY_CATEGORY_DESCRIPTION'),
                        type: 'CHANNEL',
                        channel_types: [ 4 ],
                        required: true
                    }
                ]
            },
            {
                name: 'description',
                description: getCommandDescription('TICKET_DESCRIPTION_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'description',
                        description: getCommandDescription('TICKET_DESCRIPTION_DESCRIPTION_DESCRIPTION'),
                        type: 'STRING',
                        required: true
                    }
                ]
            }
        ]
    },
    checkPermission: async interaction => {
        if(interaction.channel.parentId !== interaction.dbGuild.openTicketCategory
            && interaction.channel.parentId !== interaction.dbGuild.closedTicketCategory
            && interaction.channel.parentId !== interaction.dbGuild.archivedTicketCategory
            && ![ 'category' , 'description' ].includes(interaction.options.getSubcommand())) {
            await interaction.reply({
                content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_CHANNEL_ONLY'),
                ephemeral: true
            });
            return false;
        }

        return true;
    },
    handler: utils.subCommandHandler('ticket')
}