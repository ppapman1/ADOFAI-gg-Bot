const main = require('../main');
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

    if(vote.roles.length && !Array.from(interaction.member.roles.cache.keys()).some(r => vote.roles.includes(r)) && !main.getOwnerID().includes(interaction.user.id)) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'VOTE_NO_PERMISSION'),
        ephemeral: true
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
            const realtimeEmbed = await utils.realtimeVoteEmbed(message);
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
        const realtimeEmbed = await utils.realtimeVoteEmbed(message);
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