const { Client , Intents , Team } = require('discord.js');
const fs = require('fs');
const Dokdo = require('dokdo');
const decache = require('decache');

const setting = require('./setting.json');

const lang = require('./lang');

const Server = require('./server.json');

const client = new Client({ intents: [ Intents.FLAGS.GUILDS , Intents.FLAGS.GUILD_MESSAGES , Intents.FLAGS.GUILD_MEMBERS ] });
let DokdoHandler;

let application;
let owners = [];
let ownerID = [];
module.exports.getClient = () => client;
module.exports.getOwners = () => owners;
module.exports.getOwnerID = () => ownerID;

const ServerCache = {
    role: {},
    channel: {},
    emoji: {}
}
module.exports.Server = ServerCache;

let commandHandler = {};
let selectHandler = {};
let commands = [];
let permissions = {};

// const debug = process.argv[2] == '--debug';
// if(debug && !process.argv[3]) {
//     console.error('Debug guild missing');
//     process.exit(1);
// }

const loadOwners = async () => {
    application = await client.application.fetch();
    owners = application.owner instanceof Team ? application.owner.members.map(a => a.user) : [application.owner];
    ownerID = owners.map(a => a.id);
}

const loadDokdo = () => {
    DokdoHandler = new Dokdo(client, {
        aliases: [ 'dokdo', 'dok' ],
        prefix: ';',
        owners: application.owner instanceof Team ? application.owner.ownerId : application.owner.id
    });
}

const loadCommands = () => {
    commandHandler = {};
    commands = [];
    permissions = {};
    fs.readdirSync('./commands').forEach(c => {
        decache(`./commands/${c}`);
        const module = require(`./commands/${c}`);
        commandHandler[module.info.name] = module.handler;
        permissions[module.info.name] = module.permissions;
        commands.push(module.info);
    });
}

const loadSelectHandler = () => {
    selectHandler = {};
    fs.readdirSync('./selectHandler').forEach(c => {
        decache(`./selectHandler/${c}`);
        const module = require(`./selectHandler/${c}`);
        selectHandler[c.replace('.js', '')] = module;
    });
}

const registerCommands = async () => {
    console.log('registering command');
    // let commandInfo;
    // if(debug) commandInfo = await client.guilds.cache.get(process.argv[3]).commands.set(commands);
    // else commandInfo = await client.application.commands.set(commands);

    const commandInfo = await client.guilds.cache.get(Server.adofai_gg).commands.set(commands);
    console.log('registered command');

    console.log('registering command permissions');
    for(let c of commandInfo) {
        if(permissions[c[1].name] != null) await c[1].permissions.set({
            permissions: permissions[c[1].name]
        });
    }
    console.log('registered command permissions');
}

module.exports.loadOwners = loadOwners;
module.exports.loadDokdo = loadDokdo;
module.exports.loadCommands = loadCommands;
module.exports.loadSelectHandler = loadSelectHandler;
module.exports.registerCommands = registerCommands;

client.once('ready', async () => {
    console.log(`${client.user.tag}으로 로그인하였습니다.`);

    await loadOwners();
    loadDokdo();
    loadCommands();
    loadSelectHandler();
    await registerCommands();

    console.log('cache start');
    const guild = await client.guilds.cache.get(Server.adofai_gg);
    ServerCache.adofai_gg = guild;
    console.log('guild cached');
    for(let r in Server.role)
        ServerCache.role[r] = await guild.roles.fetch(Server.role[r]);
    console.log('role cached');
    for(let c in Server.channel)
        ServerCache.channel[c] = await client.channels.fetch(Server.channel[c]);
    console.log('channel cached');
    for(let e in Server.emoji)
        ServerCache.emoji[e] = await guild.emojis.fetch(Server.emoji[e]);
    console.log('emoji cached');

    console.log('cache finish');
});

client.on('interactionCreate', async interaction => {
    if(interaction.isCommand() || interaction.isContextMenu()) {
        if(!interaction.commandName) return;

        if(!interaction.guild) return interaction.reply({
            content: '이 기능은 서버에서만 사용할 수 있습니다.'
        });

        if(commandHandler[interaction.commandName] != null) commandHandler[interaction.commandName](interaction);
    }

    if(interaction.isSelectMenu()) {
        const params = interaction.values[0].split('_');
        const handler = selectHandler[params[0]];
        if(!handler) return interaction.reply({
            content: lang.langByChannel(interaction.channel, 'ERROR'),
            ephemeral: true
        });

        handler(interaction);
    }
});

client.on('messageCreate', message => {
    if(message.author.bot) return;

    if(message.channel.id != Server.channel.collab_application && message.content.includes(client.user.id)) {
        message.reply('reply test');
    }

    DokdoHandler.run(message);
});

client.login(setting.TOKEN);