const { Util , Embed } = require('discord.js');

const lang = require('../../lang');

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
            new Embed()
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.avatarURL()
                })
                .setColor(0x349eeb)
                .setTitle(lang.langByLangName(interaction.dbUser.lang, 'TEMPLATE_CREATE'))
                .setDescription(lang.langByLangName(interaction.dbUser.lang, 'TEMPLATE_CREATED_DESCRIPTION')
                    .replace('{type}', templateType.find(a => a.value === type).name)
                    .replace('{reasons}', Util.escapeCodeBlock(reasons.join('\n')))
                )
                .setTimestamp()
        ]
    });
}