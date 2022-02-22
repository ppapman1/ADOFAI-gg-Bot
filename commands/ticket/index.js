const { ApplicationCommandOptionType: Options, ChannelType: Channel } = require('discord.js');

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
                type: Options.Subcommand,
                options: [
                    {
                        name: 'name',
                        description: getCommandDescription('TICKET_SETNAME_NAME_DESCRIPTION'),
                        type: Options.String,
                        required: true
                    }
                ]
            },
            {
                name: 'open',
                description: getCommandDescription('TICKET_OPEN_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'close',
                description: getCommandDescription('TICKET_CLOSE_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'delete',
                description: getCommandDescription('TICKET_DELETE_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'archive',
                description: getCommandDescription('TICKET_ARCHIVE_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'unarchive',
                description: getCommandDescription('TICKET_UNARCHIVE_DESCRIPTION'),
                type: Options.Subcommand
            },
            {
                name: 'category',
                description: getCommandDescription('TICKET_CATEGORY_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'type',
                        description: getCommandDescription('TICKET_CATEGORY_TYPE_DESCRIPTION'),
                        type: Options.String,
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
                        type: Options.Channel,
                        channel_types: [Channel.GuildCategory],
                        required: true
                    }
                ]
            },
            {
                name: 'description',
                description: getCommandDescription('TICKET_DESCRIPTION_DESCRIPTION'),
                type: Options.Subcommand,
                options: [
                    {
                        name: 'description',
                        description: getCommandDescription('TICKET_DESCRIPTION_DESCRIPTION_DESCRIPTION'),
                        type: Options.String,
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