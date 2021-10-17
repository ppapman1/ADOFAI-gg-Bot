const { MessageActionRow , MessageButton } = require('discord.js');

const lang = require("../lang");

const Server = require('../server.json');

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length !== 2) return;

    if(!interaction.member.roles.cache.has(Server.role.staff)) return;

    await interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'CANCEL_WARN_CONFIRM'),
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`unwarn_${params[1]}_${interaction.message.id}`)
                        .setLabel('확인 | Confirm')
                        .setStyle('DANGER')
                )
        ],
        ephemeral: true
    });
}