const { MessageActionRow, MessageButton } = require('discord.js');

const lang = require('../../lang');

const Ticket = require('../../schemas/ticket');

const unarchiveProcessing = {};

module.exports = async interaction => {
    await interaction.deferReply();

    const ticket = await Ticket.findOne({
        channel: interaction.channel.id,
        open: false
    });
    if(!ticket) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TICKET_NOT_FOUND'));

    if(interaction.channel.parentId === interaction.dbGuild.closedTicketCategory.id)
        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TICKET_ALREADY_UNARCHIVED'));

    if(unarchiveProcessing[interaction.channel.id]) return interaction.editReply(
        lang.langByLangName(interaction.dbUser.lang, 'TICKET_ALREADY_UNARCHIVING')
    );

    const msg = await interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_UNARCHIVE_CONFIRM'),
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('ticketUnarchiveConfirm')
                        .setLabel(lang.langByLangName(interaction.dbUser.lang, 'UNARCHIVE'))
                        .setStyle('DANGER')
                )
        ]
    });

    try {
        unarchiveProcessing[interaction.channel.id] = true;

        const confirmInteraction = await msg.awaitMessageComponent({
            filter: i => i.customId == 'ticketUnarchiveConfirm',
            time: 10000
        });

        await confirmInteraction.deferUpdate();

        delete unarchiveProcessing[interaction.channel.id];
    } catch(e) {
        delete unarchiveProcessing[interaction.channel.id];

        msg.components[0].components[0].setDisabled();
        return msg.edit({
            components: msg.components
        });
    }

    await interaction.channel.setParent(interaction.dbGuild.closedTicketCategory);

    return interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_UNARCHIVED'),
        components: []
    });
}