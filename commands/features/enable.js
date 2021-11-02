const main = require('../../main');

const Guild = require('../../schemas/guild');
const FeaturesPermission = require('../../schemas/featuresPermission');

module.exports.commandHandler = async interaction => {
    const name = interaction.options.getString('name');
    const groupCommands = main.getGroupCommands();
    if(!groupCommands[name]) return interaction.reply('group not found');
    if(interaction.dbGuild.features.includes(name)) return interaction.reply('feature already enabled');

    await interaction.deferReply();

    await Guild.updateOne({
        id: interaction.guild.id
    }, {
        $push: {
            features: name
        }
    });

    const beforeCommands = await interaction.guild.commands.fetch();
    const guildCommandInfo = await interaction.guild.commands.set(Array.from(beforeCommands.values()).concat(groupCommands[name]));

    // const fullPermissions = [];
    // for (let c of guildCommandInfo) {
    //     // if (permissions[c[1].name] != null) await c[1].permissions.set({
    //     //     permissions: permissions[c[1].name]
    //     // });
    //     const permissions = await FeaturesPermission.findOne({
    //         guild: interaction.guild.id,
    //         command: c[1].name
    //     });
    //     if(permissions) fullPermissions.push({
    //         id: c[1].id,
    //         permissions: permissions.permissions
    //     });
    //     else {
    //         let permissions;
    //         try {
    //             permissions = await c[1].permissions.fetch();
    //         } catch(e) {}
    //         if(permissions) fullPermissions.push({
    //             id: c[1].id,
    //             permissions
    //         });
    //     }
    // }
    // await interaction.guild.commands.permissions.set({
    //     fullPermissions
    // });

    return interaction.editReply('enabled');
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