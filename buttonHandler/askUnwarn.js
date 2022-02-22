const { ActionRow , ButtonComponent, ButtonStyle } = require('discord.js');

const lang = require("../lang");

const Server = require('../server.json');

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length !== 2) return;

    if(!interaction.member.roles.cache.has(Server.role.staff)) return;

    await interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'CANCEL_WARN_CONFIRM'),
        components: [
            new ActionRow()
                .addComponents(
                    new ButtonComponent()
                        .setCustomId(`unwarn_${params[1]}_${interaction.message.id}`)
                        .setLabel('확인 | Confirm')
                        .setStyle(ButtonStyle.Danger)
                )
        ],
        ephemeral: true
    });
}