const { MessageActionRow , MessageButton } = require("discord.js");
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
        name: 'mute',
        description: getCommandDescription('MUTE_DESCRIPTION'),
        options: [
            {
                name: 'user',
                description: getCommandDescription('MUTE_USER_DESCRIPTION'),
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: getCommandDescription('MUTE_REASON_DESCRIPTION'),
                type: 'STRING',
                required: true,
                autocomplete: true
            },
            {
                name: 'duration',
                description: getCommandDescription('MUTE_DURATION_DESCRIPTION'),
                type: 'STRING'
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const { options } = interaction;

        const user = options.getUser('user');
        const reason = options.getString('reason') || 'No Reason';
        const duration = options.getString('duration');
        const parsedDuration = parseDuration(duration);

        const member = await interaction.guild.members.fetch(user.id);
        if(member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        if(parsedDuration && parsedDuration < 1000) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TOO_SHORT_LENGTH'));

        const length = parsedDuration || Number.MAX_SAFE_INTEGER;

        if(length >= Number.MAX_SAFE_INTEGER) {
            const replyMsg = await interaction.editReply({
                content: lang.langByLangName(interaction.dbUser.lang, 'FOREVER_CONFIRM')
                    .replace('{user}', user.username),
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('confirmmute')
                                .setLabel('확인 | Confirm')
                                .setStyle('DANGER')
                        )
                ]
            });

            try {
                await replyMsg.awaitMessageComponent({
                    filter: i => i.customId === 'confirmmute' && i.user.id === interaction.user.id,
                    time: 15000
                });
            } catch (e) {
                replyMsg.components[0].components[0].setDisabled();
                return interaction.editReply({
                    components: replyMsg.components
                });
            }
        }

        await moderator.mute({
            user: user.id,
            reason,
            duration: length,
            moderator: interaction.user.id
        });

        return interaction.editReply({
            content: lang.langByLangName(interaction.dbUser.lang, 'MUTE_USER_MUTED')
                .replace('{user}', user.tag)
                .replace('{duration}', utils.msToTime(parsedDuration, interaction.dbUser.lang !== 'ko')),
            components: []
        });
    },
    autoCompleteHandler: utils.reasonAutoCompleteHandler('PUNISHMENT')
}