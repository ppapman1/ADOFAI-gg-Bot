const api = require('../api');
const lang = require("../lang");

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length != 3) return interaction.update({
        content: lang.langByChannel(interaction.channel, 'ERROR'),
        embeds: [],
        components: []
    });
    if(params[1] != interaction.user.id) return interaction.reply({
        content: lang.langByChannel(interaction.channel, 'SELF_MESSAGE_ONLY'),
        ephemeral: true
    });

    const ranking = await api.getPPEmbedField(interaction.user.id, interaction.channel, Number(params[2]));
    if(!ranking) return interaction.update({
        content: lang.langByChannel(interaction.channel, 'ERROR'),
        embeds: [],
        components: []
    });

    return interaction.update(ranking.reply);
}