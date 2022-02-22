const { ActionRow , ButtonComponent, ButtonStyle, ApplicationCommandOptionType: Options } = require('discord.js');
const parseDuration = require('parse-duration');

const permissions = require('../../permissions');
const main = require('../../main');
const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const utils = require('../../utils');
const moderator = require('../../moderator');

const Server = require('../../server.json');

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'ban',
        description: getCommandDescription('BAN_DESCRIPTION'),
        options: [
            {
                name: 'user',
                description: getCommandDescription('BAN_USER_DESCRIPTION'),
                type: Options.User,
                required: true
            },
            {
                name: 'reason',
                description: getCommandDescription('BAN_REASON_DESCRIPTION'),
                type: Options.String,
                required: true,
                autocomplete: true
            },
            {
                name: 'duration',
                description: getCommandDescription('BAN_DURATION_DESCRIPTION'),
                type: Options.String
            },
            {
                name: 'deletedays',
                description: getCommandDescription('BAN_DELETEDAYS_DESCRIPTION'),
                type: Options.Number,
                min_value: 0,
                max_value: 7
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
        const member = options.getMember('user');
        const reason = options.getString('reason') || 'No Reason';
        const duration = options.getString('duration');
        const parsedDuration = parseDuration(duration);
        const deleteDays = options.getNumber('deletedays') || 0;
        const evidence = options.getString('evidence');

        try {
            await interaction.guild.bans.fetch(user.id);
            return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'BAN_ALREADY_BANNED'));
        } catch(e) {}

        if(member && member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        if(parsedDuration && parsedDuration < 1000) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TOO_SHORT_LENGTH'));

        const banLength = parsedDuration || Number.MAX_SAFE_INTEGER;

        if(banLength >= Number.MAX_SAFE_INTEGER) {
            const replyMsg = await interaction.editReply({
                content: lang.langByLangName(interaction.dbUser.lang, 'FOREVER_CONFIRM')
                    .replace('{user}', user.username),
                components: [
                    new ActionRow()
                        .addComponents(
                            new ButtonComponent()
                                .setCustomId('confirmban')
                                .setLabel('확인 | Confirm')
                                .setStyle(ButtonStyle.Danger)
                        )
                ]
            });

            try {
                await replyMsg.awaitMessageComponent({
                    filter: i => i.customId === 'confirmban' && i.user.id === interaction.user.id,
                    time: 15000
                });
            } catch (e) {
                replyMsg.components[0].components[0].setDisabled();
                return interaction.editReply({
                    components: replyMsg.components
                });
            }
        }

        await moderator.ban({
            user: user.id,
            reason,
            duration: banLength,
            moderator: interaction.user.id,
            deleteDays,
            evidence
        });

        return interaction.editReply({
            content: lang.langByLangName(interaction.dbUser.lang, 'BAN_USER_BANNED')
                .replace('{user}', user.tag)
                .replace('{duration}', utils.msToTime(parsedDuration, interaction.dbUser.lang !== 'ko')),
            components: []
        });
    },
    autoCompleteHandler: utils.reasonAutoCompleteHandler('PUNISHMENT')
}