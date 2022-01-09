const { MessageActionRow, MessageButton } = require('discord.js');

const lang = require('../../lang');

const Ticket = require('../../schemas/ticket');

const archiveProcessing = {};

module.exports = async interaction => {
    await interaction.deferReply();

    const ticket = await Ticket.findOne({
        channel: interaction.channel.id,
        open: false
    });
    if(!ticket) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TICKET_NOT_FOUND'));

    if(interaction.channel.parentId === interaction.dbGuild.archivedTicketCategory.id)
        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TICKET_ALREADY_ARCHIVED'));

    if(archiveProcessing[interaction.channel.id]) return interaction.editReply(
        lang.langByLangName(interaction.dbUser.lang, 'TICKET_ALREADY_ARCHIVING')
    );

    const msg = await interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_ARCHIVE_CONFIRM'),
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('ticketArchiveConfirm')
                        .setLabel(lang.langByLangName(interaction.dbUser.lang, 'ARCHIVE'))
                        .setStyle('DANGER')
                )
        ]
    });

    try {
        archiveProcessing[interaction.channel.id] = true;

        const confirmInteraction = await msg.awaitMessageComponent({
            filter: i => i.customId === 'ticketArchiveConfirm',
            time: 10000
        });

        await confirmInteraction.deferUpdate();

        delete archiveProcessing[interaction.channel.id];
    } catch(e) {
        delete archiveProcessing[interaction.channel.id];

        msg.components[0].components[0].setDisabled();
        return msg.edit({
            components: msg.components
        });
    }

    await interaction.channel.setParent(interaction.dbGuild.archivedTicketCategory);

    return interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_ARCHIVED'),
        components: []
    });
}