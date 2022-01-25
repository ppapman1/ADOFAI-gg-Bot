const { MessageEmbed , MessageActionRow , MessageButton } = require('discord.js');

const lang = require('../../lang');
const { getCommandDescription } = require('../../lang');
const utils = require('../../utils');

const Vote = require('../../schemas/vote');
const VoteOption = require('../../schemas/voteOption');

module.exports = {
    group: 'vote',
    info: {
        defaultPermission: false,
        name: 'vote',
        description: getCommandDescription('VOTE_DESCRIPTION'),
        options: [
            {
                name: 'question',
                description: getCommandDescription('VOTE_QUESTION_DESCRIPTION'),
                type: 'STRING',
                required: true
            },
            {
                name: 'options',
                description: getCommandDescription('VOTE_OPTIONS_DESCRIPTION'),
                type: 'STRING',
                required: true
            },
            {
                name: 'realtimeresult',
                description: getCommandDescription('VOTE_REALTIMERESULT_DESCRIPTION'),
                type: 'BOOLEAN',
                required: true
            },
            {
                name: 'role',
                description: getCommandDescription('VOTE_ROLE_DESCRIPTION'),
                type: 'ROLE'
            },
            {
                name: 'roles',
                description: getCommandDescription('VOTE_ROLES_DESCRIPTION'),
                type: 'STRING'
            }
        ]
    },
    handler: async interaction => {
        const { options } = interaction;

        const question = options.getString('question');
        const voteOptions = options.getString('options').split(',').map(a => a.trim());
        const realtimeResult = options.getBoolean('realtimeresult');
        const role = options.getRole('role');
        let roles = options.getString('roles');
        roles = roles ? roles.split(',').map(a => a.trim()) : [];
        if(role) roles.push(role.id);

        if(voteOptions.length > 25) return interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_TOO_MARY_OPTIONS')
                .replace('{maximum}', 25),
            ephemeral: true
        });

        if(voteOptions.some(a => a.split(':')[0].length > 80)) return interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_OPTION_TOO_LONG')
                .replace('{maximum}', 80),
            ephemeral: true
        });

        if(voteOptions.some(a => a.split(':')[1]?.length > 200)) return interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_OPTION_DESCRIPTION_TOO_LONG')
                .replace('{maximum}', 200),
            ephemeral: true
        });

        const message = await interaction.deferReply({
            fetchReply: true
        });

        await Vote.create({
            message: message.id,
            question,
            startedBy: interaction.user.id,
            realtime: realtimeResult,
            roles
        });

        const components = [];
        let buttons = [];
        for(let o of voteOptions) {
            const params = o.split(':');
            const name = params[0].trim();
            const description = params.length >= 2 ? params.slice(1).join(':').trim() : null;

            const option = new VoteOption({
                message: message.id,
                name,
                description
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
                    .setLabel(name)
                    .setStyle('PRIMARY')
            );
        }

        if(buttons.length) components.push(
            new MessageActionRow()
                .addComponents(buttons)
        );

        if(realtimeResult) {
            const realtimeEmbed = await utils.realtimeVoteEmbed(message);
            return interaction.editReply({
                embeds: [realtimeEmbed],
                components
            });
        }
        else return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('#349eeb')
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.avatarURL()
                    })
                    .setTitle(question)
                    .setDescription((roles.length ? `For : ${roles.map(r => message.guild.roles.cache.get(r).toString()).join(', ')}\n` : '') + voteOptions.map((a, i) => `**${i + 1}**. ${a.split(':')[0]}\n${a.split(':').slice(1).join(':') || ''}`.trim()).join('\n\n'))
                    .setTimestamp()
            ],
            components
        });
    }
}