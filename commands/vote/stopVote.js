const lang = require('../../lang');
const utils = require('../../utils');

const Vote = require('../../schemas/vote');
const VoteOption = require('../../schemas/voteOption');

module.exports = {
    group: 'vote',
    info: {
        defaultPermission: false,
        name: 'Stop Vote',
        type: 'MESSAGE'
    },
    handler: async interaction => {
        const message = await interaction.options.getMessage('message').fetch();

        const resultEmbed = await utils.realtimeVoteEmbed(message.id);
        if(!resultEmbed) return interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_NOT_FOUND'),
            ephemeral: true
        });

        await interaction.deferReply();

        const vote = await Vote.findOneAndDelete({
            message: message.id
        });

        await VoteOption.deleteMany({
            message: message.id
        });

        for(let r of message.components) for(let c of r.components) c.setDisabled();

        await message.edit({
            components: message.components
        });

        if(vote.realtime) return interaction.editReply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_STOPPED'),
            ephemeral: true
        });
        else return interaction.editReply({
            embeds: [resultEmbed]
        });
    }
}