const { ActionRow , ButtonComponent, ButtonStyle } = require('discord.js');

const lang = require('../../lang');

const Ticket = require('../../schemas/ticket');

const deleteProcessing = {};

module.exports = async interaction => {
    await interaction.deferReply();

    if(deleteProcessing[interaction.channel.id]) return interaction.editReply(
        lang.langByLangName(interaction.dbUser.lang, 'TICKET_ALREADY_DELETING')
    );

    const checkOpen = await Ticket.findOne({
        channel: interaction.channel.id
    });

    if(checkOpen.open) return interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_OPEN_CANT_DELETE'),
        ephemeral: true
    });

    const msg = await interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_DELETE_CONFIRM'),
        components: [
            new ActionRow()
                .addComponents(
                    new ButtonComponent()
                        .setCustomId('ticketDeleteConfirm')
                        .setLabel(lang.langByLangName(interaction.dbUser.lang, 'DELETE'))
                        .setStyle(ButtonStyle.Danger)
                )
        ]
    });

    try {
        deleteProcessing[interaction.channel.id] = true;

        const confirmInteraction = await msg.awaitMessageComponent({
            filter: i => i.customId === 'ticketDeleteConfirm',
            time: 10000
        });

        await confirmInteraction.deferUpdate();

        delete deleteProcessing[interaction.channel.id];
    } catch(e) {
        delete deleteProcessing[interaction.channel.id];

        msg.components[0].components[0].setDisabled();
        return msg.edit({
            components: msg.components
        });
    }
    
    await Ticket.deleteOne({
        channel: interaction.channel.id
    });
    
    await interaction.channel.delete();
}