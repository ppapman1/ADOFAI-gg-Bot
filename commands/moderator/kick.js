const permissions = require('../../permissions');
const main = require('../../main');
const lang = require('../../lang');
const moderator = require('../../moderator');

const Server = require('../../server.json');
const utils = require("../../utils");

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'kick',
        description: '유저를 킥합니다. // Kick the user.',
        options: [
            {
                name: 'user',
                description: '킥할 유저입니다. // User to kick.',
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: '킥 사유입니다. // It\'s the reason for kick.',
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
        const member = options.getMember('user');
        const reason = options.getString('reason') || 'No Reason';

        if(!member) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'KICK_ALREADY_KICKED'));

        if(member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        await moderator.kick(member.id, reason, interaction.user.id);

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'KICK_USER_KICKED')
            .replace('{user}', user.tag)
        );
    },
    autoCompleteHandler: utils.reasonAutoCompleteHandler('PUNISHMENT')
}