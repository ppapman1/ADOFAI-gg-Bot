const permissions = require('../permissions');
const lang = require('../lang');

module.exports = {
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'test',
        description: 'slash command test'
    },
    handler: async interaction => {
        await interaction.reply({
            content: lang.langByChannel(interaction.channel, 'TEST'),
            ephemeral: true
        });
    }
}