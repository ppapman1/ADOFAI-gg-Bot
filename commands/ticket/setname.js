const lang = require('../../lang');
const utils = require('../../utils');

// const Ticket = require('../../schemas/ticket');

module.exports = async interaction => {
    const name = interaction.options.getString('name');

    // const ticket = await Ticket.findOne({
    //     channel: interaction.channel.id
    // });

    await interaction.channel.setName(name, `${interaction.user.username} changed ticket name`);

    // const ticketUser = await interaction.client.users.fetch(ticket.user);
    // if(ticketUser) try {
    //     await ticketUser.send({
    //         embeds: [
    //             new Embed()
    //                 .setColor(0x00ff00)
    //                 .setTitle('티켓 이름 변경 / Ticket Name Changed')
    //                 .setDescription(`티켓 이름이 ${name}${utils.checkBatchim(name) ? '으' : ''}로 변경되었습니다.\nTicket name has been changed to ${name}.`)
    //                 .setTimestamp()
    //         ]
    //     });
    // } catch(e) {}

    return interaction.reply(
        lang.langByLangName(interaction.dbUser.lang, 'TICKET_NAME_CHANGED')
            .replace('{name}', name)
            .replace('{eh}', utils.checkBatchim(name) ? '으' : '')
    );
}