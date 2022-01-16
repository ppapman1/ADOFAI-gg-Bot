const { MessageEmbed } = require('discord.js');

const Guild = require('../schemas/guild');

module.exports = client => {
    client.on('voiceStateUpdate', async (before, state) => {
        const guild = await Guild.findOne({
            id: state.guild.id
        });
        if(!guild || !guild.features.includes('devserver')) return;

        const joined = state.channel !== null;
        const voiceChannel = state.channel || before.channel;

        if(!voiceChannel) return;

        const category = voiceChannel.parent;
        if(!category) return;

        const textChannel = category.children.sort((a, b) => a.position - b.position).find(c => c.type === 'GUILD_TEXT');
        if(!textChannel) return;

        const msg = await textChannel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(joined ? '#00ff00' : '#ff0000')
                    .setTitle(`유저 ${joined ? '입' : '퇴'}장`)
                    .setDescription(`${state.member}님이 음성 채널에${joined ? ' 입' : '서 퇴'}장하셨습니다.`)
                    .setFooter({
                        text: state.member.displayName,
                        iconURL: state.member.user.displayAvatarURL()
                    })
                    .setTimestamp()
            ]
        });

        setTimeout(async () => {
            await msg.delete();
        }, process.argv[2] === '--debug' ? 1000 * 10 :  1000 * 60 * 3);
    });
}