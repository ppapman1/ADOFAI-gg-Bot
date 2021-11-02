const Guild = require('../../schemas/guild');

module.exports = async interaction => {
    await interaction.deferReply({
        ephemeral: true
    });

    const description = interaction.options.getString('description');

    await Guild.updateOne({ id: interaction.guild.id }, {
        ticketGuildDescription: description
    });

    return interaction.editReply('✅');
}