const { Embed } = require('discord.js');

const main = require('../../main');

const Guild = require('../../schemas/guild');

module.exports.commandHandler = async interaction => {
    const guild = await Guild.findOne({ id: interaction.guild.id });
    const groups = main.getGroups();

    return interaction.reply({
        embeds: [
            new Embed()
                .setColor(0x349eeb)
                .setTitle('Features')
                .setDescription(groups.map(g => `${guild.features.includes(g) ? '✅' : '❌'} ${g}`).join('\n'))
                .setTimestamp()
        ]
    });
}