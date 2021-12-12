const { Util , MessageEmbed } = require('discord.js');

const ReasonTemplate = require('../../schemas/reasonTemplate');

const templateType = require('./templateType');

module.exports = async interaction => {
    const { options } = interaction;

    const type = options.getString('type');
    const reasons = options.getString('reason').split('///');

    for(let reason of reasons) {
        try {
            await ReasonTemplate.create({
                type,
                reason
            });
        } catch(e) {
            return interaction.reply({
                content: `Error\`\`\`js\n${Util.escapeCodeBlock(e.toString())}\`\`\``,
                ephemeral: true
            });
        }
    }

    return interaction.reply({
        embeds: [
            new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.avatarURL())
                .setColor('#349eeb')
                .setTitle('템플릿 생성')
                .setDescription(`"${templateType.find(a => a.value === type).name}"용 템플릿이 생성되었습니다.\n\n템플릿 목록\`\`\`\n${Util.escapeCodeBlock(reasons.join('\n'))}\`\`\``)
                .setTimestamp()
        ]
    });
}