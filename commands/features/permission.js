const { MessageActionRow , MessageButton , MessageSelectMenu } = require('discord.js');
const JSON5 = require('json5');

const main = require('../../main');
const utils = require('../../utils');

const Guild = require('../../schemas/guild');
const FeaturesPermission = require('../../schemas/featuresPermission');

module.exports.commandHandler = async interaction => {
    await interaction.deferReply();

    const command = interaction.options.getString('command');

    let permissions = await FeaturesPermission.findOne({
        guild: interaction.guild.id,
        command
    });
    if(!permissions) {
        permissions = new FeaturesPermission({
            guild: interaction.guild.id,
            command
        });
        await permissions.save();
    }

    let msg;
    const sendComponents = async () => msg = await interaction.editReply({
        fetchReply: true,
        content: `${command} command's permission list`,
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('permission')
                        .setPlaceholder('Select permission to delete')
                        .addOptions(permissions.permissions.length ? permissions.permissions.map(p => ({
                            label: `${p.type}: ${p.type === 'USER'
                                ? interaction.client.users.cache.get(p.id)?.username || 'invalid-user'
                                : interaction.guild.roles.cache.get(p.id)?.name || 'invalid-role'}`,
                            description: p.permission ? 'Allowed' : 'Denied',
                            value: `${p.type}_${p.id}`
                        })) : [{
                            label: 'fake',
                            description: 'how',
                            value: 'fake'
                        }])
                        .setDisabled(!permissions.permissions.length)
                ),
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('add')
                        .setLabel('Add')
                        .setStyle('PRIMARY')
                        .setDisabled(permissions.permissions.length >= 10),
                    new MessageButton()
                        .setCustomId('addme')
                        .setLabel('Add me')
                        .setStyle('PRIMARY')
                        .setDisabled(permissions.permissions.length >= 10),
                    new MessageButton()
                        .setCustomId('apply')
                        .setLabel('Apply')
                        .setStyle('SUCCESS')
                )
        ]
    });

    await sendComponents();

    const collector = msg.createMessageComponentCollector({
        filter: i => interaction.user.id === i.user.id,
        time: 60000
    });

    collector.on('collect', async i => {
        collector.resetTimer();

        const action = i.component.customId;
        if(action === 'add') {
            await i.deferUpdate();

            const msg = await i.channel.send({
                fetchReply: true,
                content: 'Reply here with permission json **in code block**.'
            });

            let response = await interaction.channel.awaitMessages({
                filter: m => m.author.id === interaction.user.id && m.type === 'REPLY' && m.reference.messageId === msg.id,
                max: 1,
                time: 30000
            });
            await msg.delete();
            if(!response.first()) return i.followUp({
                content: 'time out',
                ephemeral: true
            });
            try {
                await response.first().delete();
            } catch(e) {}
            response = response.first().content;

            let json = utils.parseDiscordCodeBlock(response);
            if(!json) return i.followUp({
                content: 'invalid code block message',
                ephemeral: true
            });
            try {
                json = JSON5.parse(json.code);
            } catch(e) {
                return i.followUp({
                    content: 'invalid json',
                    ephemeral: true
                });
            }
            if(!json.type || !json.id || (!json.permission && json.permission !== false)) return interaction.followUp({
                content: 'invalid permission',
                ephemeral: true
            });

            const check = permissions.permissions.find(p => p.type === json.type && p.id === json.id);
            if(check) return i.followUp({
                content: 'permission already exists',
                ephemeral: true
            });

            permissions = await FeaturesPermission.findOneAndUpdate({
                guild: interaction.guild.id,
                command
            }, {
                $push: {
                    permissions: json
                }
            }, {
                new: true
            });

            return sendComponents();
        } else if(action === 'addme') {
            const json = {
                type: 'USER',
                id: interaction.user.id,
                permission: true
            };

            const check = permissions.permissions.find(p => p.type === json.type && p.id === json.id);
            if(check) return i.reply({
                content: 'permission already exists',
                ephemeral: true
            });

            permissions = await FeaturesPermission.findOneAndUpdate({
                guild: interaction.guild.id,
                command
            }, {
                $push: {
                    permissions: json
                }
            }, {
                new: true
            });

            return sendComponents();
        } else if(action === 'apply') {
            await i.deferUpdate();

            const guildCommandPermissions = await interaction.guild.commands.permissions.fetch();
            const fullPermissions = Array.from(guildCommandPermissions).map(p => ({
                id: p[0],
                permissions: p[1]
            }));
            const guildCommandInfo = await interaction.guild.commands.fetch();
            if(!guildCommandInfo.find(c => c.name === command)) return i.follorUp({
                content: 'command not enabled yet',
                ephemeral: true
            });

            for (let c of guildCommandInfo) {
                // if (permissions[c[1].name] != null) await c[1].permissions.set({
                //     permissions: permissions[c[1].name]
                // });
                const permissions = await FeaturesPermission.findOne({
                    guild: interaction.guild.id,
                    command: c[1].name
                });
                if(permissions) fullPermissions.push({
                    id: c[1].id,
                    permissions: permissions.permissions
                });
                else {
                    let permissions;
                    try {
                        permissions = await c[1].permissions.fetch();
                    } catch(e) {}
                    if(permissions) fullPermissions.push({
                        id: c[1].id,
                        permissions
                    });
                }
            }
            await interaction.guild.commands.permissions.set({
                fullPermissions
            });

            return i.followUp({
                content: 'permission applied',
                ephemeral: true
            });
        } else if(action === 'permission') {
            const params = i.values[0].split('_');
            const permission = permissions.permissions.find(p => p.type === params[0] && p.id === params[1]);
            if(!permission) {
                await sendComponents();
                return interaction.deferUpdate();
            }

            permissions = await FeaturesPermission.findOneAndUpdate({
                guild: interaction.guild.id,
                command
            }, {
                $pull: {
                    permissions: permission
                }
            }, {
                new: true
            });

            await i.deferUpdate();
            return sendComponents();
        }
    });

    collector.on('end', () => {
        msg.components[0].components[0].setDisabled();
        msg.components[1].components[0].setDisabled();
        msg.components[1].components[1].setDisabled();
        msg.components[1].components[2].setDisabled();

        return interaction.editReply({
            components: msg.components
        });
    });
}

module.exports.autoCompleteHandler = interaction => {
    const command = interaction.options.getString('command');

    const nameRegex = new RegExp(command, 'i');
    const commands = interaction.guild.commands.cache.map(c => c.name).filter(f => nameRegex.test(f));

    return interaction.respond(commands.slice(0, 25).map(f => ({
        name: f,
        value: f
    })));
}