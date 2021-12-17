const lang = require('../lang');
const utils = require('../utils');

const Vote = require('../schemas/vote');
const VoteOption = require('../schemas/voteOption');

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length !== 2) return;

    const message = interaction.message;

    const vote = await Vote.findOne({
        message: message.id
    });

    const beforeVote = await VoteOption.findOneAndUpdate({
        message: message.id,
        users: interaction.user.id
    }, {
        $pull: {
            users: interaction.user.id
        }
    });
    if(beforeVote && beforeVote.id === params[1]) {
        if(vote.realtime) {
            const realtimeEmbed = await utils.realtimeVoteEmbed(message.id);
            return interaction.update({
                embeds: [realtimeEmbed]
            });
        }
        else interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_CANCELED')
                .replace('{option}', beforeVote.name),
            ephemeral: true
        });
    }

    const updated = await VoteOption.findOneAndUpdate({
        id: params[1]
    }, {
        $push: {
            users: interaction.user.id
        }
    });
    if(!updated) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_NOT_FOUND'),
        ephemeral: true
    });

    if(vote.realtime) {
        const realtimeEmbed = await utils.realtimeVoteEmbed(message.id);
        return interaction.update({
            embeds: [realtimeEmbed]
        });
    }
    else if(beforeVote) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_CHANGED')
            .replace('{beforeoption}', beforeVote.name)
            .replace('{option}', updated.name),
        ephemeral: true
    });
    else return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_VOTED')
            .replace('{option}', updated.name),
        ephemeral: true
    });
}