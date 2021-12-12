const lang = require("../lang");
const moderator = require('../moderator');

const Server = require("../server.json");

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length !== 3) return;

    if(!interaction.member.roles.cache.has(Server.role.staff)) return;

    interaction.message.components[0].components[0].setDisabled();
    await interaction.update({
        components: interaction.message.components
    });

    await moderator.unwarn(params[1], interaction.user.id);

    const warnMsg = await interaction.channel.messages.fetch(params[2]);
    warnMsg.components[0].components[0].setDisabled();
    await warnMsg.edit({
        components: warnMsg.components
    });

    await interaction.followUp({
        content: lang.langByLangName(interaction.dbUser.lang, 'CANCEL_WARN_BUTTON_SUCCESS'),
        ephemeral: true
    });
}