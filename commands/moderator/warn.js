const { ApplicationCommandOptionType: Options } = require('discord.js');

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
        name: 'warn',
        description: getCommandDescription('WARN_DESCRIPTION'),
        options: [
            {
                name: 'user',
                description: getCommandDescription('WARN_USER_DESCRIPTION'),
                type: Options.User,
                required: true
            },
            {
                name: 'reason',
                description: getCommandDescription('WARN_REASON_DESCRIPTION'),
                type: Options.String,
                required: true,
                autocomplete: true
            },
            {
                name: 'amount',
                description: getCommandDescription('WARN_AMOUNT_DESCRIPTION'),
                type: Options.Integer,
                required: true,
                min_value: 1,
                max_value: 10
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
        const amount = options.getInteger('amount');
        const evidence = options.getString('evidence');

        if(amount < 1 || amount > 10) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'WRONG_WARN_AMOUNT'));

        const member = await interaction.guild.members.fetch(user.id);
        if(member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        await moderator.warn({
            user: user.id,
            reason,
            moderator: interaction.user.id,
            amount,
            evidence
        });

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'WARN_USER_WARNED')
            .replace('{user}', user.tag)
        );
    },
    autoCompleteHandler: utils.reasonAutoCompleteHandler('PUNISHMENT')
}