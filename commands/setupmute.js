const permissions = require('../permissions');
const lang = require('../lang');
const main = require("../main");

module.exports = {
    private: true,
    permissions: permissions.staffOnly,
    info: {
        defaultPermission: false,
        name: 'setupmute',
        description: '뮤트 역할을 설정합니다. // Set the mute role.'
    },
    handler: async interaction => {
        const mute = main.Server.role.mute;

        await interaction.deferReply({
            ephemeral: true
        });

        await interaction.guild.channels.fetch();

        for(let c of interaction.guild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').values())
            await c.permissionOverwrites.create(mute, {
                SEND_MESSAGES: false,
                SEND_MESSAGES_IN_THREADS: false,
                CREATE_PUBLIC_THREADS: false,
                CREATE_PRIVATE_THREADS: false,
                ADD_REACTIONS: false,
                SPEAK: false,
                STREAM: false
            }, {
                reason: 'setup mute role'
            });

        for(let c of interaction.guild.channels.cache.filter(c => [ 'GUILD_TEXT' , 'GUILD_NEWS' , 'GUILD_VOICE' , 'GUILD_STAGE_VOICE' ].includes(c.type) && !c.permissionsLocked).values())
            await c.permissionOverwrites.create(mute, {
                SEND_MESSAGES: false,
                SEND_MESSAGES_IN_THREADS: false,
                CREATE_PUBLIC_THREADS: false,
                CREATE_PRIVATE_THREADS: false,
                ADD_REACTIONS: false,
                SPEAK: false,
                STREAM: false
            }, {
                reason: 'setup mute role'
            });

        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'MUTE_ROLE_SETUP_FINISH'));
    }
}