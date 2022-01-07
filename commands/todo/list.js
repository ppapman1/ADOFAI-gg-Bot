const lang = require('../../lang');
const { getListMessage } = require('./');

module.exports = async interaction => {
    await interaction.deferReply();

    const event = interaction.options.getString('target');

    let checkEvent;
    try {
        checkEvent = await interaction.guild.scheduledEvents.fetch(event);
    } catch(e) {
        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'EVENT_NOT_FOUND'));
    }

    const msg = await getListMessage(interaction.guild.id, event, interaction.dbUser.lang, checkEvent);
    return interaction.editReply(msg);
}