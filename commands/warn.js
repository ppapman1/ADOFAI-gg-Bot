const permissions = require('../permissions');
const main = require('../main');
const lang = require('../lang');
const moderator = require('../moderator');

const Server = require('../server.json');

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'warn',
        description: '유저에게 경고를 부여합니다. // Warn the user.',
        options: [
            {
                name: 'user',
                description: '경고할 유저입니다. // User to warn.',
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: '경고 사유입니다. // It\'s the reason for warn.',
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
        if(member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        await moderator.warn(user.id, reason, interaction.user.id);

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'WARN_USER_WARNED')
            .replace('{user}', user.tag)
        );
    }
}