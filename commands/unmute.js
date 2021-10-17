const permissions = require('../permissions');
const lang = require('../lang');
const moderator = require('../moderator');

const Server = require('../server.json');

const User = require('../schemas/user');

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'unmute',
        description: '유저를 뮤트 해제합니다. // Unmute the user.',
        options: [
            {
                name: 'user',
                description: '뮤트를 해제할 유저입니다. // User to unmute.',
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: '뮤트 해제 사유입니다. // It\'s the reason for unmute.',
                type: 'STRING',
                required: true
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const { options } = interaction;

        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No Reason';

        const member = await interaction.guild.members.fetch(user.id);
        if(member.roles.cache.has(Server.role.staff)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        const checkUser = await User.findOne({
            id: user.id
        });
        if(!checkUser || !checkUser.unmuteAt) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'UNMUTE_ALREADY_UNMUTED')
            .replace('{user}', user.tag)
        );

        await moderator.unmute(user.id, reason, interaction.user.id);

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'UNMUTE_USER_UNMUTED')
            .replace('{user}', user.tag)
        );
    }
}