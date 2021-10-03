const fs = require('fs');

const permissions = require('../../permissions');
const lang = require('../../lang');
const main = require("../../main");

module.exports = {
    private: true,
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
            }
        ]
    },
    handler: async interaction => {
        if(interaction.channel.parentId != main.Server.channel.openTicketCategory.id
            && interaction.channel.parentId != main.Server.channel.closedTicketCategory.id)
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