const { ActionRow, SelectMenuComponent, SelectMenuOption, Embed } = require('discord.js');

const utils = require('../utils');

const Ticket = require('../schemas/ticket');
const User = require("../schemas/user");
const Guild = require("../schemas/guild");

const createProcessing = {};
const stopNewTicket = {};

module.exports = client => {
    client.on('messageCreate', async message => {
        if(message.author.bot) return;

        let user = await User.findOne({ id : message.author.id });

        if(user && user.blacklist) return;

        if(message.channel.type === 'DM') {
            if(createProcessing[message.author.id]) return message.channel.send('이미 티켓 생성이 진행중입니다. 서버를 선택해주세요.\nTicket generation is already underway. Please select server.');

            let ticketChannel;
            let ticket = await Ticket.findOne({
                user: message.author.id,
                open: true
            });
            if(!ticket) {
                if(stopNewTicket[message.author.id]) return;

                if(message.stickers.size) return message.reply('스티커로는 티켓을 열 수 없습니다.\nTickets cannot be opened with stickers.');

                if(message.content.startsWith('/')) {
                    const checkCommandMsg = 'confirm';

                    await message.channel.send(`명령어를 사용하려고 시도한 것으로 보입니다. 명령어는 서버에서 사용해 주세요. 티켓을 열려는 목적이었다면 "${checkCommandMsg}"${utils.checkBatchim(checkCommandMsg) ? '을' : '를'} 입력해주세요.\nIt appears that you have attempted to use the command. Please use the command on the server. If you wanted to open the ticket, please enter "${checkCommandMsg}".`);

                    stopNewTicket[message.author.id] = true;

                    const response = await message.channel.awaitMessages({
                        filter: m => m.content === checkCommandMsg,
                        max: 1,
                        time: 20000
                    });
                    if(!response.first()) {
                        delete stopNewTicket[message.author.id];
                        return message.channel.send('시간이 초과되었습니다.');
                    }
                }

                const guilds = await Guild.find({
                    features: 'ticket'
                });
                if(!guilds.length) return message.channel.send('티켓을 생성할 수 있는 서버가 없습니다.\nThere are no servers that can create tickets.');

                const msg = await message.channel.send({
                    content: '티켓을 여시겠습니까? 티켓을 열려면 아래에서 열 서버를 선택해주세요.\nDo you want to open the ticket? Please select the server below to open the ticket.',
                    components: [
                        new ActionRow()
                            .addComponents(
                                new SelectMenuComponent()
                                    .setCustomId('selectGuild')
                                    .setPlaceholder('티켓을 열 서버를 선택하세요. / Select ticket server.')
                                    .addOptions(...guilds.map(g =>
                                        new SelectMenuOption()
                                            .setLabel(message.client.guilds.cache.get(g.id)?.name || '알 수 없음')
                                            .setDescription(g.ticketGuildDescription)
                                            .setValue(g.id)
                                    ))
                            )
                    ]
                });

                let confirmInteraction;
                try {
                    createProcessing[message.author.id] = true;

                    confirmInteraction = await msg.awaitMessageComponent({
                        filter: i => i.customId === 'selectGuild',
                        time: 30000
                    });

                    delete createProcessing[message.author.id];
                    delete stopNewTicket[message.author.id];
                } catch(e) {
                    delete createProcessing[message.author.id];
                    delete stopNewTicket[message.author.id];

                    msg.components[0].components[0].setDisabled();
                    return msg.edit({
                        components: msg.components
                    });
                }

                msg.components[0].components[0].setDisabled();
                await msg.edit({
                    components: msg.components
                });

                const guild = message.client.guilds.cache.get(confirmInteraction.values[0]);
                const dbGuild = await Guild.findOne({ id: guild.id });

                const channelName = `ticket-${message.author.username}-${message.author.id}`;
                ticketChannel = await guild.channels.create(channelName, {
                    parent: dbGuild.openTicketCategory,
                    reason: 'User created ticket'
                });

                await Ticket.create({
                    user: message.author.id,
                    guild: guild.id,
                    channel: ticketChannel.id
                });

                await ticketChannel.send({
                    embeds: [
                        new Embed()
                            .setColor(0x42a7ff)
                            .setTitle('새로운 티켓 생성 / New Ticket')
                            .setDescription(`새로운 티켓 ${channelName}${utils.checkBatchim(channelName) ? '이' : '가'} 생성되었습니다. 이곳에 ${message.client.user}를 멘션하고 말하면 메시지가 전달됩니다.\nA new ticket ${channelName} has been created. If you mention ${message.client.user} here, the message will be delivered.\n\n사용자 언어(User Language) : ${confirmInteraction.locale}`)
                            .setTimestamp()
                            .setFooter({
                                text: message.author.username,
                                iconURL: message.author.avatarURL()
                            })
                    ]
                });

                await confirmInteraction.reply({
                    embeds: [
                        new Embed()
                            .setColor(0x42a7ff)
                            .setTitle('새로운 티켓 생성 / New Ticket')
                            .setDescription('새로운 티켓이 생성되었습니다. 이곳에 메시지를 적으면 관리자에게 메시지를 더 전달할 수 있습니다.\nA new ticket has been created. If you write a message here, you can deliver more messages to the administrator.')
                            .setTimestamp()
                            .setFooter({
                                text: message.author.username,
                                iconURL: message.author.avatarURL()
                            })
                    ]
                });
            }
            else ticketChannel = await message.client.guilds.cache.get(ticket.guild).channels.fetch(ticket.channel);

            try {
                console.log(message.attachments);
                await sendTicketMessage(ticketChannel, message.author.username, message.author.avatarURL(), message.content, [...message.attachments.values()]);
                await message.react('✅');
            } catch(e) {
                console.log(e);
                await message.react('❌');
            }
        }

        if(message.channel.type === 'GUILD_TEXT') {
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

            const splitContent = content && content.length > 2000;

            try {
                await ticketUser.send({
                    content: content ? content.substring(0, 2000) : null,
                    files: splitContent ? [] : [...message.attachments.values()]
                });
                if(splitContent) await ticketUser.send({
                    content: content.substring(2000, 4000),
                    files: [...message.attachments.values()]
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

    const splitContent = content && content.length > 2000;

    await webhook.send({
        content: content ? content.substring(0, 2000) : null,
        username,
        avatarURL,
        files: splitContent ? [] : files,
        allowedMentions: {
            parse: []
        }
    });
    if(splitContent) await webhook.send({
        content: content.substring(2000, 4000),
        username,
        avatarURL,
        files,
        allowedMentions: {
            parse: []
        }
    });
}