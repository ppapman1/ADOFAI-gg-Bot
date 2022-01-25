const Guild = require('../../schemas/guild');

module.exports = async interaction => {
    await interaction.deferReply();

    const channel = interaction.options.getChannel('channel');

    await Guild.updateOne({
        id: interaction.guild.id
    }, {
        todoNoticeChannel: channel.id
    });

    return interaction.editReply('✅');
}