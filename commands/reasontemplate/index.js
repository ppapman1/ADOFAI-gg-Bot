const fs = require('fs');

const lang = require('../../lang');
const main = require("../../main");

module.exports = {
    private: true,

    info: {
        name: 'features',
        description: '서버 기능 관련 명령어입니다. // It\'s a server features related command.',
        options: [
            {
                name: 'enable',
                description: '서버의 기능을 활성화합니다. // Enable server\'s feature.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: '기능의 이름입니다.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'disable',
                description: '서버의 기능을 비활성화합니다. // Disable server\'s feature.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: '기능의 이름입니다.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'list',
                description: '서버의 기능 목록을 확인합니다. // Check server\'s features list.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'permission',
                description: '서버 기능 명령어의 권한을 설정합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'command',
                        description: '권한을 설정할 명령어입니다. // Command to set permissions.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            }
        ]
    },
    handler: async interaction => {
        if(main.getTeamOwner() !== interaction.user.id) return interaction.reply('🤔');

        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/features/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/features/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] === '--debug') delete require.cache[file];
            const handler = require(file);
            if(handler.commandHandler) handler.commandHandler(interaction);
            else handler(interaction);
        }
        else interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
            ephemeral: true
        });
    },
    autoCompleteHandler: async interaction => {
        if(!main.getOwnerID().includes(interaction.user.id)) return interaction.respond([]);

        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/features/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/features/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] === '--debug') delete require.cache[file];
            const handler = require(file);
            if(handler.autoCompleteHandler) handler.autoCompleteHandler(interaction);
        }
    }
}