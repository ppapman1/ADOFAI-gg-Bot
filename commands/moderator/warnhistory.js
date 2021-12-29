const { MessageEmbed } = require('discord.js');

const permissions = require('../../permissions');
const lang = require('../../lang');

const Server = require('../../server.json');

const Warn = require('../../schemas/warn');

module.exports = {
    private: true,
    info: {
        name: 'warnhistory',
        description: '경고 기록을 확인합니다. // Warn the user.',
        options: [
            {
                name: 'all',
                description: '적용되지 않는 모든 경고를 표시합니다. // Displays all warns that do not apply.',
                type: 'BOOLEAN'
            },
            {
                name: 'user',
                description: '경고를 확인할 유저입니다. // User to check warn.',
                type: 'USER'
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply({
            ephemeral: true
        });

        const { options } = interaction;

        const all = options.getBoolean('all');
        const user = interaction.member.roles.cache.has(Server.role.staff) ? (options.getUser('user') || interaction.user) : interaction.user;

        const warns = await Warn.find({
            user: user.id,
            createdAt: { $gt : all ? 0 : Date.now() - (1000 * 60 * 60 * 24 * 60) }
        });

        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('#e86b6b')
                    .setAuthor({
                        name: `${warns.length} Warnings for ${user.tag} (${user.id})`,
                        iconURL: user.avatarURL()
                    })
                    .addFields((await Promise.all(warns.map(async a => ({
                        name: `ID: ${a.id} | Moderator: ${(await interaction.client.users.fetch(a.moderator)).tag}`,
                        value: `${a.reason} - <t:${Math.floor(a.createdAt / 1000)}:R>`
                    })))))
            ]
        });
    }
}