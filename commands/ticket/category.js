const Guild = require('../../schemas/guild');

module.exports = async interaction => {
    await interaction.deferReply({
        ephemeral: true
    });

    const { options } = interaction;

    const type = options.getString('type');
    const category = options.getChannel('category');

    await Guild.updateOne({ id: interaction.guild.id }, {
        [type]: category.id
    });

    return interaction.editReply('✅');
}