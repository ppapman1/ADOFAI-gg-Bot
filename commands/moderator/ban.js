const { MessageActionRow , MessageButton } = require('discord.js');
const parseDuration = require('parse-duration');

const permissions = require('../../permissions');
const main = require('../../main');
const lang = require('../../lang');
const utils = require('../../utils');
const moderator = require('../../moderator');

const Server = require('../../server.json');

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'ban',
        description: '유저를 밴합니다. // Ban the user.',
        options: [
            {
                name: 'user',
                description: '밴할 유저입니다. // User to ban.',
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: '밴 사유입니다. // It\'s the reason for ban.',
                type: 'STRING',
                required: true
            },
            {
                name: 'duration',
                description: '밴할 기간을 입력합니다. 예) 1d 2h // Enter the period to ban. ex) 1d 2h',
                type: 'STRING'
            },
            {
                name: 'deletedays',
                description: '메시지를 삭제할 일수를 입력합니다. // Enter the days to delete message.',
                type: 'NUMBER'
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const { options } = interaction;

        const member = options.getMember('user');
        const reason = options.getString('reason') || 'No Reason';
        const duration = options.getString('duration');
        const parsedDuration = parseDuration(duration);
        const deleteDays = options.getNumber('deletedays') || 0;

        if(member.roles.cache.has(Server.role.staff) && !main.getOwnerID().includes(interaction.user.id)) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'CANNOT_MANAGE_STAFF'));

        if(deleteDays < 0 || deleteDays > 7) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'DELETE_DAYS_RANGE'));

        if(parsedDuration && parsedDuration < 1000) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TOO_SHORT_LENGTH'));

        try {
            await interaction.guild.bans.fetch(member.id);
            return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'BAN_ALREADY_BANNED'));
        } catch(e) {}

        const banLength = parsedDuration || Number.MAX_SAFE_INTEGER;

        if(banLength >= Number.MAX_SAFE_INTEGER) {
            const replyMsg = await interaction.editReply({
                content: lang.langByLangName(interaction.dbUser.lang, 'FOREVER_CONFIRM'),
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('confirmban')
                                .setLabel('확인 | Confirm')
                                .setStyle('DANGER')
                        )
                ]
            });

            try {
                const i = await replyMsg.awaitMessageComponent({
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

        await moderator.ban(member.id, reason, banLength, interaction.user.id, false, deleteDays);

        return interaction.editReply({
            content: lang.langByLangName(interaction.dbUser.lang, 'BAN_USER_BANNED')
                .replace('{user}', member.user.tag)
                .replace('{duration}', utils.msToTime(parsedDuration, interaction.dbUser.lang !== 'ko')),
            components: []
        });
    }
}