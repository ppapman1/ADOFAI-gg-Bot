const permissions = require('../../permissions');
const lang = require('../../lang');

const moderator = require('../../moderator');

const User = require('../../schemas/user');
const utils = require("../../utils");

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'unban',
        description: '유저를 밴 해제합니다. // unban the user.',
        options: [
            {
                name: 'user',
                description: '밴를 해제할 유저입니다. // User to unban.',
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: '밴 해제 사유입니다. // It\'s the reason for unban.',
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