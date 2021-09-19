const api = require('../api');
const lang = require("../lang");

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length != 3) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
        embeds: [],
        components: []
    });
    if(params[1] != interaction.user.id) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'SELF_MESSAGE_ONLY'),
        ephemeral: true
    });

    const ranking = await api.getPPEmbedField(interaction, Number(params[2]));
    if(!ranking) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
        embeds: [],
        components: []
    });

    return interaction.update(ranking.reply);
}