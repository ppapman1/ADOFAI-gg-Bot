const main = require('../../main');

const Guild = require('../../schemas/guild');
const FeaturesPermission = require('../../schemas/featuresPermission');

module.exports.commandHandler = async interaction => {
    const name = interaction.options.getString('name');
    const groupCommands = main.getGroupCommands();
    if(!groupCommands[name]) return interaction.reply('group not found');
    if(!interaction.dbGuild.features.includes(name)) return interaction.reply('group not enabled');

    await interaction.deferReply();

    await Guild.updateOne({
        id: interaction.guild.id
    }, {
        $pull: {
            features: name
        }
    });

    const beforeCommands = await interaction.guild.commands.fetch();
    const groupCommandNames = groupCommands[name].map(command => command.name);
    await interaction.guild.commands.set(beforeCommands.filter(c => !groupCommandNames.includes(c.name)));

    return interaction.editReply('disabled');
}

module.exports.autoCompleteHandler = interaction => {
    const name = interaction.options.getString('name');

    const nameRegex = new RegExp(name, 'i');
    const features = main.getGroups().filter(f => nameRegex.test(f));

    return interaction.respond(features.map(f => ({
        name: f,
        value: f
    })));
}