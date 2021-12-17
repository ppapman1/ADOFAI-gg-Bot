const { MessageEmbed , MessageActionRow , MessageButton } = require('discord.js');

const lang = require('../../lang');
const utils = require('../../utils');

const Vote = require('../../schemas/vote');
const VoteOption = require('../../schemas/voteOption');

module.exports = {
    group: 'vote',
    info: {
        defaultPermission: false,
        name: 'vote',
        description: '투표를 시작합니다. // Start a vote.',
        options: [
            {
                name: 'question',
                description: '투표의 질문입니다. // The question of the vote.',
                type: 'STRING',
                required: true
            },
            {
                name: 'options',
                description: '투표할 항목들을 쉼표(,)로 구분하여 입력합니다. // The options of the vote, separated by commas.',
                type: 'STRING',
                required: true
            },
            {
                name: 'realtimeresult',
                description: '실시간으로 투표 결과를 보여줍니다. // Show the realtime result of the vote.',
                type: 'BOOLEAN',
                required: true
            }
        ]
    },
    handler: async interaction => {
        const { options } = interaction;

        const question = options.getString('question');
        const voteOptions = options.getString('options').split(',').map(a => a.trim());
        const realtimeResult = options.getBoolean('realtimeresult');

        if(voteOptions.length > 25) return interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_TOO_MARY_OPTIONS')
                .replace('{maximum}', 25),
            ephemeral: true
        });

        if(voteOptions.some(a => a.length > 80)) return interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_OPTION_TOO_LONG')
                .replace('{maximum}', 80),
            ephemeral: true
        });

        const message = await interaction.deferReply({
            fetchReply: true
        });

        await Vote.create({
            message: message.id,
            question,
            startedBy: interaction.user.id,
            realtime: realtimeResult
        });

        const components = [];
        let buttons = [];
        for(let o of voteOptions) {
            const option = new VoteOption({
                message: message.id,
                name: o
            });
            await option.save();

            if(buttons.length >= 5) {
                components.push(
                    new MessageActionRow()
                        .addComponents(buttons)
                );
                buttons = [];
            }

            buttons.push(
                new MessageButton()
                    .setCustomId(`vote_${option.id}`)
                    .setLabel(o)
                    .setStyle('PRIMARY')
            );
        }

        if(buttons.length) components.push(
            new MessageActionRow()
                .addComponents(buttons)
        );

        if(realtimeResult) {
            const realtimeEmbed = await utils.realtimeVoteEmbed(message.id);
            return interaction.editReply({
                embeds: [realtimeEmbed],
                components
            });
        }
        else return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('#349eeb')
                    .setAuthor(interaction.user.username, interaction.user.avatarURL())
                    .setTitle(question)
                    .setDescription(voteOptions.map((a, i) => `**${i + 1}**. ${a}`).join('\n'))
                    .setTimestamp()
            ],
            components
        });
    }
}