const permissions = require('../../permissions');
const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');

const moderator = require('../../moderator');

const User = require('../../schemas/user');
const utils = require("../../utils");

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'unban',
        description: getCommandDescription('UNBAN_DESCRIPTION'),
        options: [
            {
                name: 'user',
                description: getCommandDescription('UNBAN_USER_DESCRIPTION'),
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: getCommandDescription('UNBAN_REASON_DESCRIPTION'),
                type: 'STRING',
                required: true,
                autocomplete: true
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const { options } = interaction;

        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No Reason';

        const checkUser = await User.findOne({
            id: user.id
        });
        if(!checkUser || !checkUser.unbanAt) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'UNBAN_ALREADY_UNBANNED')
            .replace('{user}', user.tag)
        );

        await moderator.unban(user.id, reason, interaction.user.id);

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'UNBAN_USER_UNBANNED')
            .replace('{user}', user.tag)
        );
    },
    autoCompleteHandler: utils.reasonAutoCompleteHandler('PUNISHMENT_REMOVE')
}