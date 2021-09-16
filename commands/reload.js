const permissions = require('../permissions');
const main = require("../main");
const lang = require("../lang");
const utils = require("../utils");

module.exports = {
    permissions: permissions.ownerOnly,
    info: {
        defaultPermission: false,
        name: 'reload',
        description: '봇의 기능들을 리로드합니다. // Reload the functions of the bot.',
        options: [
            {
                name: 'owners',
                description: '디스코드 애플리케이션 소유자 정보를 다시 가져옵니다.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'dokdo',
                description: 'dokdo를 재설정합니다. // Reset dokdo.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'commands',
                description: '슬래시 커맨드를 다시 등록합니다. // Register the slash command again.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'modules',
                description: '슬래시 커맨드 모듈을 다시 불러옵니다. // Recall the slash command module.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'lang',
                description: '언어 파일을 다시 불러옵니다. // I bring up the language file again.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'select',
                description: '셀렉트 메뉴 핸들러를 다시 불러옵니다. // Recall the select menu handler.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'button',
                description: '버튼 핸들러를 다시 불러옵니다. // Recall the button handler.',
                type: 'SUB_COMMAND'
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply({
            ephemeral: true
        });

        const target = interaction.options.getSubcommand();

        switch(target) {
            case 'modules':
                main.loadCommands();
                break;
            case 'commands':
                await main.registerCommands();
                break;
            case 'dokdo':
                await main.loadDokdo();
                break;
            case 'owners':
                await main.loadOwners();
                break;
            case 'lang':
                lang.load();
                break;
            case 'select':
                main.loadSelectHandler();
                break;
            case 'button':
                main.loadButtonHandler();
                break;
            default:
                return interaction.editReply(lang.langByChannel(interaction.channel, 'UNKNOWN_RELOAD_TARGET'));
        }

        await interaction.editReply(lang.langByChannel(interaction.channel, 'RELOADED')
            .replace('{target}', target)
            .replace('{el_rel}', utils.checkBatchim(target) ? '을' : '를')
        );
    }
}