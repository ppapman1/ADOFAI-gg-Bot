const { Client , Intents , Team } = require('discord.js');
const fs = require('fs');
const Dokdo = require('dokdo');
const path = require('path');

const setting = require('./setting.json');
const utils = require('./utils');

const api = require('./api');
const lang = require('./lang');
const moderator = require('./moderator');

const Server = require('./server.json');

const User = require('./schemas/user');
const Ticket = require('./schemas/ticket');
const Warn = require('./schemas/warn');
const Guild = require('./schemas/guild');
const Eval = require('./schemas/eval');
const FeaturesPermission = require('./schemas/featuresPermission');

const intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES
];

if(process.argv[2] === '--debug') {
    intents.push(Intents.FLAGS.GUILD_MEMBERS);
    intents.push(Intents.FLAGS.GUILD_PRESENCES);
}

const client = new Client({
    intents,
    partials: [
        'CHANNEL'
    ]
});
let DokdoHandler;

let application;
let owners = [];
let ownerID = [];
let teamOwner;
module.exports.getOwners = () => owners;
module.exports.getOwnerID = () => ownerID;
module.exports.getTeamOwner = () => teamOwner;

const ServerCache = {
    role: {},
    channel: {},
    emoji: {}
}
module.exports.Server = ServerCache;
moderator.setup(client, ServerCache);

const connect = require('./schemas');
connect();

let commandHandler = {};
let autoCompleteHandler = {};
let selectHandler = {};
let buttonHandler = {};
let commands = [];
let allCommands = [];
let privateCommands = [];
let groupCommands = {};
let permissions = {};
let groupByCommand = {};

module.exports.getGroups = () => Object.keys(groupByCommand);
module.exports.getGroupCommands = () => groupCommands;

const debug = process.argv[2] === '--debug';
if(debug && !process.argv[3]) {
    console.error('Debug guild missing');
    process.exit(1);
}

const loadOwners = async () => {
    application = await client.application.fetch();
    owners = application.owner instanceof Team ? application.owner.members.map(a => a.user) : [application.owner];
    ownerID = owners.map(a => a.id);
    teamOwner = application.owner instanceof Team ? application.owner.ownerId : application.owner.id;
}

const loadDokdo = () => {
    DokdoHandler = new Dokdo(client, {
        aliases: [ 'dokdo', 'dok' ],
        prefix: setting.DOKDO_PREFIX,
        owners: teamOwner,
        secrets: [
            setting.MONGODB_HOST,
            setting.MONGODB_PORT,
            setting.MONGODB_HOST,
            setting.MONGODB_USER,
            setting.MONGODB_PASSWORD
        ],
        globalVariable: {
            User,
            Ticket,
            Warn,
            Server,
            setting,
            utils,
            api,
            lang,
            main: module.exports,
            moderator,
            Guild,
            Eval,
            FeaturesPermission
        }
    });

    module.exports.getGlobalVariable = () => DokdoHandler.globalVariable;
}

const loadCommands = () => {
    commandHandler = {};
    commands = [];
    allCommands = [];
    privateCommands = [];
    groupCommands = {};
    permissions = {};
    groupByCommand = {};

    const registerLoop = (c, sub) => {
        c.forEach(c => {
            if(!c.endsWith('.js') && !fs.existsSync(path.join('./commands', c, 'index.js'))) return registerLoop(fs.readdirSync(path.join('./commands', c)), c);
            const file = require.resolve('./' + path.join('commands', sub || '', c));
            delete require.cache[file];
            const module = require(file);
            commandHandler[module.info.name] = module.handler;
            if(module.autoCompleteHandler) autoCompleteHandler[module.info.name] = module.autoCompleteHandler;
            if(module.private) {
                privateCommands.push(module.info);
                permissions[module.info.name] = module.permissions;
            }
            else if(typeof module.group === 'string') {
                if(!groupCommands[module.group]) groupCommands[module.group] = [];
                groupCommands[module.group].push(module.info);
                groupByCommand[module.info.name] = module.group;
            }
            else commands.push(module.info);

            if(typeof module.group !== 'string') allCommands.push(module.info);
        });
    }

    registerLoop(fs.readdirSync('./commands'));
}

const loadSelectHandler = () => {
    selectHandler = {};
    fs.readdirSync('./selectHandler').forEach(c => {
        const file = require.resolve(`./selectHandler/${c}`);
        delete require.cache[file];
        const module = require(`./selectHandler/${c}`);
        selectHandler[c.replace('.js', '')] = module;
    });
}

const loadButtonHandler = () => {
    buttonHandler = {};
    fs.readdirSync('./buttonHandler').forEach(c => {
        const file = require.resolve(`./buttonHandler/${c}`);
        delete require.cache[file];
        const module = require(`./buttonHandler/${c}`);
        buttonHandler[c.replace('.js', '')] = module;
    });
}

const registerCommands = async () => {
    if(debug) {
        console.log('registering debug guild command...');
        const guildCommandInfo = await client.guilds.cache.get(process.argv[3]).commands.set(allCommands);
        console.log('registered debug guild command. registering debug guild command permission...');
        const fullPermissions = [];
        for (let c of guildCommandInfo) {
            // if (permissions[c[1].name] != null) await c[1].permissions.set({
            //     permissions: permissions[c[1].name]
            // });
            if(permissions[c[1].name] != null) fullPermissions.push({
                id: c[1].id,
                permissions: permissions[c[1].name]
            });
        }
        await client.guilds.cache.get(process.argv[3]).commands.permissions.set({
            fullPermissions
        });
        console.log('registered debug guild command permission. registering feature guild command...');
    }
    else {
        console.log('registering global command...');
        await client.application.commands.set(commands);
        console.log('registered global command. registering guild command...');

        const guildCommandInfo = await client.guilds.cache.get(process.argv[3] || Server.adofai_gg).commands.set(privateCommands);
        console.log('registered guild command. registering guild command permission...');
        const fullPermissions = [];
        for (let c of guildCommandInfo) {
            // if (permissions[c[1].name] != null) await c[1].permissions.set({
            //     permissions: permissions[c[1].name]
            // });
            if(permissions[c[1].name] != null) fullPermissions.push({
                id: c[1].id,
                permissions: permissions[c[1].name]
            });
        }
        await client.guilds.cache.get(process.argv[3] || Server.adofai_gg).commands.permissions.set({
            fullPermissions
        });

        console.log('registered guild command permission. registering feature guild command...');
    }

    const featureGuilds = await Guild.find({ 'features.0' : { $exists: true } });
    for(let g of featureGuilds) {
        const guild = client.guilds.cache.get(g.id);

        const beforeCommands = await guild.commands.fetch();
        let commandInfos = guild.id === (process.argv[3] || Server.adofai_gg) ? Array.from(beforeCommands.values()) : [];
        for(let f of g.features) commandInfos = commandInfos.concat(groupCommands[f]);

        const guildCommandInfo = await guild.commands.set(commandInfos);
        console.log(`registered ${guild.name} guild command. registering feature guild command permission...`);
        const fullPermissions = [];
        for (let c of guildCommandInfo) {
            // if (permissions[c[1].name] != null) await c[1].permissions.set({
            //     permissions: permissions[c[1].name]
            // });
            const permissions = await FeaturesPermission.findOne({
                guild: g.id,
                command: c[1].name
            });
            if(permissions != null) fullPermissions.push({
                id: c[1].id,
                permissions: permissions.permissions
            });
        }
        await guild.commands.permissions.set({
            fullPermissions
        });
        console.log(`registered ${guild.name} guild command permission.`);
    }

    console.log('registered all feature guild command permission.');

    // const guilds = client.guilds.cache.map(guild => guild.id);
    // for(let g of guilds) {
    //     console.log(`registering command in ${g}`);
    //     const commandInfo = await client.guilds.cache.get(g).commands.set(commands);
    //     console.log(`registered command in ${g}`);
    //
    //     console.log(`registering command permissions in ${g}`);
    //     for(let c of commandInfo) {
    //         if(permissions[c[1].name] != null) await c[1].permissions.set({
    //             permissions: permissions[c[1].name]
    //         });
    //     }
    //     console.log(`registered command permissions in ${g}`);
    // }
}

const cacheServer = async () => {
    console.log('cache start');
    const guild = await client.guilds.cache.get(Server.adofai_gg);
    ServerCache.adofai_gg = process.argv[3] ? await client.guilds.cache.get(process.argv[3]) : guild;
    console.log('guild cached');
    for(let r in Server.role)
        ServerCache.role[r] = await ServerCache.adofai_gg.roles.fetch(Server.role[r]);
    console.log('role cached');
    for(let c in Server.channel)
        ServerCache.channel[c] = await client.channels.fetch(Server.channel[c]);
    console.log('channel cached');
    for(let e in Server.emoji)
        ServerCache.emoji[e] = await guild.emojis.fetch(Server.emoji[e]);
    console.log('emoji cached');

    console.log('cache finish');
}

const loadHandler = () => {
    fs.readdirSync('./handler').forEach(f => {
        const file = require.resolve(`./handler/${f}`);
        delete require.cache[file];
        require(file)(client);

        console.log(`loaded handler ${f}`);
    });
}

module.exports.loadOwners = loadOwners;
module.exports.loadDokdo = loadDokdo;
module.exports.loadCommands = loadCommands;
module.exports.loadSelectHandler = loadSelectHandler;
module.exports.loadButtonHandler = loadButtonHandler;
module.exports.registerCommands = registerCommands;
module.exports.loadHandler = loadHandler;

client.once('ready', async () => {
    console.log(`${client.user.tag}으로 로그인하였습니다.`);

    await loadOwners();
    loadDokdo();
    loadCommands();
    loadSelectHandler();
    loadButtonHandler();
    cacheServer();
    registerCommands();
    loadHandler();
});

client.on('interactionCreate', async interaction => {
    let user = await User.findOne({ id : interaction.user.id });
    let guild;
    if(interaction.guild) guild = await Guild.findOne({ id : interaction.guild.id });
    if(!user) {
        user = new User({
            id: interaction.user.id
        });
        await user.save();

        if(interaction.isCommand()) try {
            await interaction.channel.send(`${interaction.user}\n${lang.getFirstTimeString()}`);
        } catch (e) {}
        else try {
            await interaction.user.send(`${interaction.user}\n${lang.getFirstTimeString()}`);
        } catch (e) {}
    }
    if(!guild && interaction.guild) {
        guild = new Guild({
            id: interaction.guild.id
        });
        await guild.save();
    }

    if(user.blacklist && !ownerID.includes(user.id)) return;

    interaction.dbUser = user;
    if(interaction.guild) interaction.dbGuild = guild;

    if(interaction.isCommand() || interaction.isContextMenu()) {
        if(!interaction.commandName) return;

        if(!interaction.guild) return interaction.reply(
            lang.langByLangName(interaction.dbUser.lang, 'SERVER_ONLY')
        );

        if(commandHandler[interaction.commandName] != null) commandHandler[interaction.commandName](interaction);
    }

    if(interaction.isSelectMenu()) {
        if(!interaction.values[0]) return;
        const params = interaction.values[0].split('_');
        const handler = selectHandler[params[0]];
        if(!handler) return;

        handler(interaction);
    }

    if(interaction.isButton()) {
        const params = interaction.customId.split('_');
        const handler = buttonHandler[params[0]];
        if(!handler) return;

        handler(interaction);
    }

    if(interaction.isAutocomplete()) {
        if(!interaction.commandName) return;

        if(autoCompleteHandler[interaction.commandName] != null) autoCompleteHandler[interaction.commandName](interaction);
    }
});

client.on('messageCreate', message => {
    if(message.author.bot) return;

    if(DokdoHandler) DokdoHandler.run(message);
});

client.on('guildDelete', async guild => {
    await Guild.deleteOne({
        id: guild.id
    });
});

client.on('debug', d => {
    if(debug) console.log(d);
});

client.login(setting.TOKEN);