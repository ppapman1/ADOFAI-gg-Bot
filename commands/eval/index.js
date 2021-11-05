const fs = require('fs');

const permissions = require('../../permissions');
const lang = require('../../lang');
const main = require('../../main');

module.exports = {
    group: 'eval',
    info: {
        defaultPermission: false,
        name: 'eval',
        description: 'eval 관련 명령어들입니다.',
        options: [
            {
                name: 'create',
                description: 'eval 명령 설정을 생성합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'eval의 이름입니다.',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'info',
                description: 'eval의 정보를 확인합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'eval의 이름입니다.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'message',
                description: '간단한 eval 메시지를 전송합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'eval의 이름입니다.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    },
                    {
                        name: 'message',
                        description: 'eval 메시지 내용입니다.',
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: 'buttontext',
                        description: '버튼에 들어갈 글자입니다.',
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: 'buttoncolor',
                        description: '버튼의 색입니다.',
                        type: 'STRING',
                        required: true,
                        choices: [
                            {
                                name: '파란색+보라색',
                                value: 'PRIMARY'
                            },
                            {
                                name: '회색',
                                value: 'SECONDARY'
                            },
                            {
                                name: '초록색',
                                value: 'SUCCESS'
                            },
                            {
                                name: '빨간색',
                                value: 'DANGER'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    handler: async interaction => {
        if(!main.getOwnerID().includes(interaction.user.id)) return interaction.reply('🤔');

        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/eval/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/eval/${command}.js`)) {
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
        if(!fs.existsSync(`./commands/eval/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/eval/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] === '--debug') delete require.cache[file];
            const handler = require(file);
            if(handler.autoCompleteHandler) handler.autoCompleteHandler(interaction);
        }
    }
}