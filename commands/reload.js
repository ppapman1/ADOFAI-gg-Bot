const permissions = require('../permissions');
const main = require("../main");
const lang = require("../lang");
const { getCommandDescription } = require('../lang');
const utils = require("../utils");

module.exports = {
    private: true,
    permissions: permissions.ownerOnly,
    info: {
        defaultPermission: false,
        name: 'reload',
        description: getCommandDescription('RELOAD_DESCRIPTION'),
        options: [
            {
                name: 'owners',
                description: getCommandDescription('RELOAD_OWNERS_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'jejudo',
                description: getCommandDescription('RELOAD_JEJUDO_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'commands',
                description: getCommandDescription('RELOAD_COMMANDS_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'modules',
                description: getCommandDescription('RELOAD_MODULES_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'lang',
                description: getCommandDescription('RELOAD_LANG_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'select',
                description: getCommandDescription('RELOAD_SELECT_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'button',
                description: getCommandDescription('RELOAD_BUTTON_DESCRIPTION'),
                type: 'SUB_COMMAND'
            },
            {
                name: 'handler',
                description: getCommandDescription('RELOAD_HANDLER_DESCRIPTION'),
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
            case 'jejudo':
                await main.loadJejudo();
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
            case 'handler':
                main.loadHandler();
                break;
            default:
                return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'UNKNOWN_RELOAD_TARGET'));
        }

        await interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'RELOADED')
            .replace('{target}', target)
            .replace('{el_rel}', utils.checkBatchim(target) ? '을' : '를')
        );
    }
}