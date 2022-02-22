const { ApplicationCommandOptionType: Options } = require('discord.js');

const permissions = require('../../permissions');
const main = require('../../main');
const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const moderator = require('../../moderator');

const Server = require('../../server.json');

const User = require('../../schemas/user');
const utils = require("../../utils");

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'unmute',
        description: getCommandDescription('UNMUTE_DESCRIPTION'),
        options: [
            {
                name: 'user',
                description: getCommandDescription('UNMUTE_USER_DESCRIPTION'),
                type: Options.User,
                required: true
            },
            {
                name: 'reason',
                description: getCommandDescription('UNMUTE_REASON_DESCRIPTION'),
                type: Options.String,
                required: true,
                autocomplete: true
            },
            {
                name: 'evidence',
                description: getCommandDescription('BAN_EVIDENCE_DESCRIPTION'),
                type: Options.String
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const { options } = interaction;

        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No Reason';
        const evidence = options.getString('evidence');

        const member = await interaction.guild.members.fetch(user.id);
        if(member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        const checkUser = await User.findOne({
            id: user.id
        });
        if(!checkUser || !checkUser.unmuteAt) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'UNMUTE_ALREADY_UNMUTED')
            .replace('{user}', user.tag)
        );

        await moderator.unmute({
            user: user.id,
            reason,
            moderator: interaction.user.id,
            evidence
        })

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'UNMUTE_USER_UNMUTED')
            .replace('{user}', user.tag)
        );
    },
    autoCompleteHandler: utils.reasonAutoCompleteHandler('PUNISHMENT_REMOVE')
}