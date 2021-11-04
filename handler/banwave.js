const { Util , MessageActionRow , MessageButton } = require('discord.js');

const main = require('../main.js');
const utils = require('../utils.js');

const moderator = require('../moderator');

module.exports = client => {
    client.on('messageCreate', async message => {
        if(!message.guild || message.guild.id !== main.Server.adofai_gg.id) return;
        if(!main.getOwnerID().includes(message.author.id)) return;

        const bot_mentions = [
            `<@${message.client.user.id}>`,
            `<@!${message.client.user.id}>`
        ];
        const bot_mentions_regex = bot_mentions.map(a => new RegExp(utils.escapeRegExp(a)));

        if(!message.content.includes(bot_mentions[0]) && !message.content.includes(bot_mentions[1])) return;

        let content = message.content;
        for(let r of bot_mentions_regex) content = content.replace(r, '').trim();

        const params = content.split(' ');

        if(params[0] !== 'banwave' || params.length !== 3) return;

        let firstMsg = await message.channel.messages.fetch({
            limit: 3,
            around: params[1]
        });
        firstMsg = firstMsg.last();
        const secondMsg = await message.channel.messages.fetch(params[2]);

        const afterMessages = await message.channel.messages.fetch({
            limit: 100,
            after: firstMsg.id
        });
        if(!afterMessages.get(secondMsg.id)) return message.reply('so wide, maximum 100');

        const messages = afterMessages.filter(m => m.createdTimestamp >= firstMsg.createdTimestamp && m.createdTimestamp <= secondMsg.createdTimestamp);
        const users = Array.from(new Set(messages.map(m => m.member)));
        
        const msg = await message.channel.send({
            content: `Ban List\`\`\`${users.map(m => Util.escapeCodeBlock(m.user.username)).join('\n')}\`\`\``,
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('confirm')
                            .setLabel('Ban')
                            .setStyle('DANGER')
                    )
            ]
        });

        try {
            const i = await msg.awaitMessageComponent({
                filter: i => i.user.id === message.author.id,
                time: 15000
            });

            await i.deferUpdate();
        } catch(e) {
            return message.reply('time out');
        }

        msg.components[0].components[0].setDisabled();
        await msg.edit({
            components: msg.components
        });

        for(let m of users)
            await moderator.ban(m.id, '긴급 스팸 대량 차단 / Emergency spam blocking', Number.MAX_SAFE_INTEGER, message.client.user.id, false, 1);

        return message.reply('ban finish');
    });
}