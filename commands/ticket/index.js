const fs = require('fs');

const permissions = require('../../permissions');
const lang = require('../../lang');
const main = require("../../main");

module.exports = {
    group: 'ticket',
    // private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'ticket',
        description: '티켓 관리 관련 명령어입니다. // This is an order related to ticket management.',
        options: [
            {
                name: 'setname',
                description: '티켓의 이름을 설정합니다. // Set the name of the ticket.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: '티켓의 이름입니다. // This is the name of the ticket.',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'open',
                description: '닫힌 티켓을 다시 엽니다. // Re-open the closed ticket.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'close',
                description: '티켓을 닫습니다. // Close the ticket.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'delete',
                description: '티켓을 삭제합니다. // Delete the ticket.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'archive',
                description: '티켓을 아카이브합니다. // Archive the ticket.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'unarchive',
                description: '티켓을 아카이브 해제합니다. // Unarchive the ticket.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'category',
                description: '티켓 카테고리를 설정합니다. // Set ticket category.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'type',
                        description: '카테고리 종류입니다. // This is the type of the category.',
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
                        description: '설정할 카테고리입니다.',
                        type: 'CHANNEL',
                        channel_types: [ 4 ],
                        required: true
                    }
                ]
            },
            {
                name: 'description',
                description: '티켓의 설명을 설정합니다. // Set the description of the ticket.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'description',
                        description: '티켓의 설명입니다. // This is the description of the ticket.',
                        type: 'STRING',
                        required: true
                    }
                ]
            }
        ]
    },
    handler: async interaction => {
        if(interaction.channel.parentId !== interaction.dbGuild.openTicketCategory
            && interaction.channel.parentId !== interaction.dbGuild.closedTicketCategory
        && interaction.channel.parentId !== interaction.dbGuild.archivedTicketCategory
        && ![ 'category' , 'description' ].includes(interaction.options.getSubcommand()))
            return interaction.reply({
                content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_CHANNEL_ONLY'),
                ephemeral: true
            });

        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/ticket/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/ticket/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] == '--debug') delete require.cache[file];
            require(file)(interaction);
        }
        else interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
            ephemeral: true
        });
    }
}