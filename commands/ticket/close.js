const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const lang = require('../../lang');

const Ticket = require('../../schemas/ticket');

const closeProcessing = {};

module.exports = async interaction => {
    await interaction.deferReply();

    const ticket = await Ticket.findOne({
        channel: interaction.channel.id,
        open: true
    });
    if(!ticket) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TICKET_NOT_FOUND'));

    if(closeProcessing[interaction.channel.id]) return interaction.editReply(
        lang.langByLangName(interaction.dbUser.lang, 'TICKET_ALREADY_CLOSING')
    );

    const msg = await interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_CLOSE_CONFIRM'),
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('ticketCloseConfirm')
                        .setLabel(lang.langByLangName(interaction.dbUser.lang, 'CLOSE'))
                        .setStyle('DANGER')
                )
        ]
    });

    try {
        closeProcessing[interaction.channel.id] = true;

        const confirmInteraction = await msg.awaitMessageComponent({
            filter: i => i.customId === 'ticketCloseConfirm',
            time: 10000
        });

        await confirmInteraction.deferUpdate();

        delete closeProcessing[interaction.channel.id];
    } catch(e) {
        delete closeProcessing[interaction.channel.id];

        msg.components[0].components[0].setDisabled();
        return msg.edit({
            components: msg.components
        });
    }

    await interaction.channel.setParent(interaction.dbGuild.closedTicketCategory);

    await Ticket.updateOne({
        channel: interaction.channel.id
    }, {
        open: false
    });

    const ticketUser = await interaction.client.users.fetch(ticket.user);

    if(ticketUser) try {
        await ticketUser.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('티켓 닫힘 / Ticket Closed')
                    .setDescription(`${interaction.channel.name} 티켓이 닫혔습니다. 봇에게 다른 메시지를 보내 티켓을 새로 열 수 있습니다.\nTickets ${interaction.channel.name} have been closed. You can send another message to the bot to open a new ticket.`)
            ]
        });
    } catch(e) {}

    return interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'TICKET_CLOSED'),
        components: []
    });
}