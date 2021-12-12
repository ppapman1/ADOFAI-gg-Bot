const fs = require('fs');

const permissions = require('../../permissions');
const lang = require('../../lang');
const main = require("../../main");

module.exports = {
    info: {
        name: 'blacklist',
        description: '블랙리스트 관련 명령어입니다. // It\'s a blacklist related command.',
        options: [
            {
                name: 'add',
                description: '블랙리스트에 유저를 추가합니다. // Add a user to the blacklist.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'user',
                        description: '추가할 유저입니다. // It\'s a user to add.',
                        type: 'USER',
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: '블랙리스트에서 유저를 제거합니다. // Remove the user from the blacklist.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'user',
                        description: '제거할 유저입니다. // It\'s a user to remove.',
                        type: 'USER',
                        required: true
                    }
                ]
            }
        ]
    },
    handler: async interaction => {
        if(!main.getOwnerID().includes(interaction.user.id)) return interaction.reply('🤔');

        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/blacklist/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/blacklist/${command}.js`)) {
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