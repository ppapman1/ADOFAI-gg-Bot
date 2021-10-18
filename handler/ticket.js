const { MessageActionRow , MessageButton , MessageEmbed } = require('discord.js');

const main = require('../main');
const utils = require('../utils');

const Ticket = require('../schemas/ticket');
const User = require("../schemas/user");

const createProcessing = {};

module.exports = client => {
    client.on('messageCreate', async message => {
        if(message.author.bot) return;

        let user = await User.findOne({ id : message.author.id });

        if(user && user.blacklist) return;

        if(message.channel.type == 'DM') {
            if(createProcessing[message.author.id]) return message.channel.send('이미 티켓 생성이 진행중입니다. "열기"를 눌러주세요.\nTicket generation is already underway. Please press "Open".');

            let ticketChannel;
            let ticket = await Ticket.findOne({
                user: message.author.id,
                open: true
            });
            if(!ticket) {
                const msg = await message.channel.send({
                    content: '티켓을 여시겠습니까? 티켓을 열려면 아래 "열기" 버튼을 눌러주세요.\nDo you want to open the ticket? Press the "Open" button below to open the ticket.',
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('confirmTicket')
                                    .setLabel('열기 / Open')
                                    .setStyle('SUCCESS')
                            )
                    ]
                });

                let confirmInteraction;
                try {
                    createProcessing[message.author.id] = true;

                    confirmInteraction = await msg.awaitMessageComponent({
                        filter: i => i.customId == 'confirmTicket',
                        time: 30000
                    });

                    delete createProcessing[message.author.id];
                } catch(e) {
                    delete createProcessing[message.author.id];

                    msg.components[0].components[0].setDisabled();
                    return msg.edit({
                        components: msg.components
                    });
                }

                const channelName = `ticket-${message.author.username}-${message.author.id}`;
                ticketChannel = await main.Server.adofai_gg.channels.create(channelName, {
                    parent: main.Server.channel.openTicketCategory,
                    reason: 'User created ticket'
                });

                await Ticket.create({
                    user: message.author.id,
                    channel: ticketChannel.id
                });

                await ticketChannel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#42a7ff')
                            .setTitle('새로운 티켓 생성 / New Ticket')
                            .setDescription(`새로운 티켓 ${channelName}${utils.checkBatchim(channelName) ? '이' : '가'} 생성되었습니다. 이곳에 ${message.client.user}를 멘션하고 말하면 메시지가 전달됩니다.\nA new ticket ${channelName} has been created. If you mention ${message.client.user} here, the message will be delivered.`)
                            .setTimestamp()
                            .setFooter(message.author.username, message.author.avatarURL())
                    ]
                });

                await confirmInteraction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#42a7ff')
                            .setTitle('새로운 티켓 생성 / New Ticket')
                            .setDescription('새로운 티켓이 생성되었습니다. 이곳에 메시지를 적으면 관리자에게 메시지를 더 전달할 수 있습니다.\nA new ticket has been created. If you write a message here, you can deliver more messages to the administrator.')
                            .setTimestamp()
                            .setFooter(message.author.username, message.author.avatarURL())
                    ]
                });
            }
            else ticketChannel = await main.Server.adofai_gg.channels.fetch(ticket.channel);

            try {
                await sendTicketMessage(ticketChannel, message.author.username, message.author.avatarURL(), message.content, message.attachments);
                await message.react('✅');
            } catch(e) {
                await message.react('❌');
            }
        }

        if(message.channel.type == 'GUILD_TEXT') {
            const ticket = await Ticket.findOne({
                channel: message.channel.id,
                open: true
            });
            if(!ticket) return;

            const ticketUser = await message.client.users.fetch(ticket.user);

            const bot_mentions = [
                `<@${message.client.user.id}>`,
                `<@!${message.client.user.id}>`
            ];
            const bot_mentions_regex = bot_mentions.map(a => new RegExp(utils.escapeRegExp(a)));

            if(!message.content.includes(bot_mentions[0]) && !message.content.includes(bot_mentions[1])) return;

            let content = message.content;
            for(let r of bot_mentions_regex) content = content.replace(r, '');

            try {
                await ticketUser.send({
                    content: content || null,
                    files: message.attachments
                });
                await message.react('✅');
            } catch(e) {
                await message.react('❌');
            }
        }
    });
}

const sendTicketMessage = async (channel, username, avatarURL, content, files) => {
    let webhook;
    const webhooks = await channel.fetchWebhooks();
    if(!webhooks.size) webhook = await channel.createWebhook('ADOFAI.gg Ticket Webhook');
    else webhook = webhooks.first();

    await webhook.send({
        content: content || null,
        username,
        avatarURL,
        files
    });
}