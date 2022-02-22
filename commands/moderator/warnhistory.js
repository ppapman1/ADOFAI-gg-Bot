const { Embed, ApplicationCommandOptionType: Options } = require('discord.js');

const { getCommandDescription } = require('../../lang');
const main = require('../../main');
const Server = require('../../server.json');

const Warn = require('../../schemas/warn');

module.exports = {
    private: true,
    info: {
        name: 'warnhistory',
        description: getCommandDescription('WARNHISTORY_DESCRIPTION'),
        options: [
            {
                name: 'all',
                description: getCommandDescription('WARNHISTORY_ALL_DESCRIPTION'),
                type: Options.Boolean
            },
            {
                name: 'user',
                description: getCommandDescription('WARNHISTORY_USER_DESCRIPTION'),
                type: Options.User
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply({
            ephemeral: true
        });

        const { options } = interaction;

        const all = options.getBoolean('all');
        const user = (interaction.member.roles.cache.has(Server.role.staff)
            || main.getOwnerID().includes(interaction.user.id)) ? (options.getUser('user') || interaction.user) : interaction.user;

        const warns = await Warn.find({
            user: user.id,
            createdAt: { $gt : all ? 0 : Date.now() - (1000 * 60 * 60 * 24 * 60) }
        });

        await interaction.editReply({
            embeds: [
                new Embed()
                    .setColor(0xe86b6b)
                    .setAuthor({
                        name: `${warns.length} Warnings for ${user.tag} (${user.id})`,
                        iconURL: user.avatarURL()
                    })
                    .addFields(...(await Promise.all(warns.map(async a => ({
                        name: `ID: ${a.id} | Moderator: ${(await interaction.client.users.fetch(a.moderator)).tag}`,
                        value: `${a.reason} - <t:${Math.floor(a.createdAt / 1000)}:R>`
                    })))))
            ]
        });
    }
}