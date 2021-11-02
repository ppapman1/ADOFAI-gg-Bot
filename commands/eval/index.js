const fs = require('fs');

const permissions = require('../../permissions');
const lang = require('../../lang');
const main = require("../../main");

module.exports = {
    private: true,
    permissions: permissions.teamOwnerOnly,
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
                name: 'delete',
                description: 'eval을 삭제합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'eval의 이름을 검색합니다.',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'list',
                description: 'eval의 목록을 확인합니다.',
                type: 'SUB_COMMAND'
            }
        ]
    },
    handler: async interaction => {
        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/eval/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/eval/${command}.js`)) {
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