const permissions = require('../../permissions');
const main = require('../../main');
const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const moderator = require('../../moderator');

const Server = require('../../server.json');
const utils = require("../../utils");

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'kick',
        description: getCommandDescription('KICK_DESCRIPTION'),
        options: [
            {
                name: 'user',
                description: getCommandDescription('KICK_USER_DESCRIPTION'),
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: getCommandDescription('KICK_REASON_DESCRIPTION'),
                type: 'STRING',
                required: true,
                autocomplete: true
            },
            {
                name: 'evidence',
                description: getCommandDescription('BAN_EVIDENCE_DESCRIPTION'),
                type: 'STRING'
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const { options } = interaction;

        const user = options.getUser('user');
        const member = options.getMember('user');
        const reason = options.getString('reason') || 'No Reason';
        const evidence = options.getString('evidence');

        if(!member) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'KICK_ALREADY_KICKED'));

        if(member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        await moderator.kick({
            user: member.id,
            reason,
            moderator: interaction.user.id,
            evidence
        });

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'KICK_USER_KICKED')
            .replace('{user}', user.tag)
        );
    },
    autoCompleteHandler: utils.reasonAutoCompleteHandler('PUNISHMENT')
}