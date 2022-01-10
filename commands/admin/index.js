const fs = require('fs');

const permissions = require('../../permissions');
const lang = require('../../lang');
const main = require('../../main');

module.exports = {
    info: {
        name: 'admin',
        description: '봇 관리자 전용 명령어입니다. // This is a bot manager-only command.',
        options: [
            {
                name: 'clearcommand',
                description: '디스코드 애플리케이션에 등록된 슬래시 커맨드를 모두 삭제합니다. 봇 재시작이 필요합니다.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'trackerror',
                description: '봇의 오류 트래킹 DM을 토글합니다.',
                type: 'SUB_COMMAND'
            }
        ]
    },
    handler: async interaction => {
        if(!main.getOwnerID().includes(interaction.user.id)) return interaction.reply('🤔');

        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/admin/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/admin/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] === '--debug') delete require.cache[file];
            require(file)(interaction);
        }
        else interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
            ephemeral: true
        });
    }
}