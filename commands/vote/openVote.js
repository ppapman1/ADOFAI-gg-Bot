const { Embed, ActionRow, ButtonComponent, ButtonStyle, ApplicationCommandType: Command } = require('discord.js');

const lang = require('../../lang');
const utils = require('../../utils');

const Vote = require('../../schemas/vote');
const VoteOption = require('../../schemas/voteOption');

module.exports = {
    group: 'vote',
    info: {
        defaultPermission: false,
        name: 'Open Vote',
        type: Command.Message
    },
    handler: async interaction => {
        const message = await interaction.options.getMessage('message').fetch();

        const resultEmbed = await utils.realtimeVoteEmbed(message);
        if(!resultEmbed) return interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_NOT_FOUND'),
            ephemeral: true
        });

        await interaction.deferReply({
            ephemeral: true
        });

        const vote = await Vote.findOne({
            message: message.id
        });
        if(!vote) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'VOTE_NOT_FOUND'));

        const voteOptions = await VoteOption.find({
            message: message.id
        });

        const embed = new Embed()
            .setColor(0x349eeb)
            .setTitle(vote.question)
            .addFields(...await Promise.all(voteOptions.map(async a => ({
                name: `${a.name} (\`${a.users.length}\` Vote${a.users.length > 1 ? 's' : ''})`,
                value: a.users.length ? (await Promise.all(a.users.map(u => interaction.client.users.fetch(u)))).map(u => u.tag).join('\n').substring(0, 1024) : 'Nobody Voted',
                inline: true
            }))))
            .setTimestamp();

        const msg = await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRow()
                    .addComponents(
                        new ButtonComponent()
                            .setLabel('Vote')
                            .setStyle(ButtonStyle.Link)
                            .setURL(message.url)
                            .setEmoji({
                                name: '🔗'
                            }),
                        new ButtonComponent()
                            .setCustomId('public')
                            .setLabel(lang.langByLangName(interaction.dbUser.lang, 'PUBLIC'))
                            .setStyle(ButtonStyle.Primary)
                    )
            ]
        });

        try {
            const i = await msg.awaitMessageComponent({
                time: 30000
            });
            await i.deferUpdate();
        } catch(e) {
            msg.components[0].components[1].setDisabled();
            return interaction.editReply({
                components: msg.components
            });
        }

        return interaction.followUp({
            embeds: [embed],
            components: [
                new ActionRow()
                    .addComponents(
                        new ButtonComponent()
                            .setLabel('Vote')
                            .setStyle(ButtonStyle.Link)
                            .setURL(message.url)
                            .setEmoji({
                                name: '🔗'
                            })
                    )
            ]
        });
    }
}