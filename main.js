const { Client, Team, Embed, GatewayIntentBits, Partials, ApplicationCommandPermissionType: CommandPermissions } = require('discord.js');
const fs = require('fs');
const Dokdo = require('dokdo');
const path = require('path');
const util = require('util');

const setting = require('./setting.json');
const utils = require('./utils');

const api = require('./api');
const adofaiAPI = require('./adofaiapi');
const lang = require('./lang');
const moderator = require('./moderator');
const music = require('./music');

const Server = require('./server.json');

const User = require('./schemas/user');
const Ticket = require('./schemas/ticket');
const Warn = require('./schemas/warn');
const Guild = require('./schemas/guild');
const Eval = require('./schemas/eval');
const FeaturesPermission = require('./schemas/featuresPermission');
const MusicQueue = require('./schemas/musicQueue');
const ADOFAIArtist = require('./schemas/ADOFAIArtist');
const ReasonTemplate = require('./schemas/reasonTemplate');
const Vote = require('./schemas/vote');
const VoteOption = require('./schemas/voteOption');
const CommandHistory = require('./schemas/commandHistory');
const InteractionHistory = require('./schemas/interactionHistory');
const Todo = require('./schemas/todo');

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates
];

if(process.argv[2] === '--debug') {
    intents.push(...[
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]);
}

const client = new Client({
    intents,
    partials: [
        Partials.Channel,
        Partials.Message
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
adofaiAPI.setup();
utils.setup(client);

const connect = require('./schemas');
connect();

let permissionHandler = {};
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
let dmAllowedCommands = [];

module.exports.getGroups = () => [...new Set(Object.values(groupByCommand))];
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
    const globalVariable = {
        ServerCache,
        User,
        Ticket,
        Warn,
        Server,
        setting,
        utils,
        api,
        adofaiAPI,
        lang,
        main: module.exports,
        moderator,
        music,
        Guild,
        Eval,
        FeaturesPermission,
        MusicQueue,
        ADOFAIArtist,
        ReasonTemplate,
        Vote,
        VoteOption,
        CommandHistory,
        InteractionHistory,
        Todo
    }

    DokdoHandler = new Dokdo(client, {
        aliases: [ 'dokdo', 'dok' ],
        prefix: setting.DOKDO_PREFIX,
        owners: teamOwner,
        isOwner: async user => {
            const checkUser = await User.findOne({
                id: user.id
            });
            if(!checkUser) return false;

            return checkUser.dokdoPermission || false;
        },
        secrets: [
            setting.MONGODB_HOST,
            setting.MONGODB_PORT,
            setting.MONGODB_HOST,
            setting.MONGODB_USER,
            setting.MONGODB_PASSWORD
        ],
        globalVariable
    });

    module.exports.getGlobalVariable = () => globalVariable;
}

const loadCommands = () => {
    permissionHandler = {};
    commandHandler = {};
    commands = [];
    allCommands = [];
    privateCommands = [];
    groupCommands = {};
    permissions = {};
    groupByCommand = {};
    dmAllowedCommands = [];

    const registerLoop = (c, sub) => {
        c.forEach(c => {
            if(!c.endsWith('.js') && !fs.existsSync(path.join('./commands', c, 'index.js'))) return registerLoop(fs.readdirSync(path.join('./commands', c)), c);
            const file = require.resolve('./' + path.join('commands', sub || '', c));
            delete require.cache[file];
            const module = require(file);
            if(module.checkPermission) permissionHandler[module.info.name] = module.checkPermission;
            commandHandler[module.info.name] = module.handler;
            if(module.autoCompleteHandler) autoCompleteHandler[module.info.name] = module.autoCompleteHandler;
            if(module.setup) module.setup(client);
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

            if(module.allowDM) dmAllowedCommands.push(module.info.name);
        });
    }

    registerLoop(fs.readdirSync('./commands'));
}

const loadSelectHandler = () => {
    selectHandler = {};
    fs.readdirSync('./selectHandler').forEach(c => {
        const file = require.resolve(`./selectHandler/${c}`);
        delete require.cache[file];
        selectHandler[c.replace('.js', '')] = require(`./selectHandler/${c}`);
    });
}

const loadButtonHandler = () => {
    buttonHandler = {};
    fs.readdirSync('./buttonHandler').forEach(c => {
        const file = require.resolve(`./buttonHandler/${c}`);
        delete require.cache[file];
        buttonHandler[c.replace('.js', '')] = require(`./buttonHandler/${c}`);
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
        const guildCommandPermissions = await guild.commands.permissions.fetch();
        const fullPermissions = Array.from(guildCommandPermissions).map(p => ({
            id: p[0],
            permissions: p[1]
        }));
        for (let c of guildCommandInfo) {
            // if (permissions[c[1].name] != null) await c[1].permissions.set({
            //     permissions: permissions[c[1].name]
            // });
            const permissions = await FeaturesPermission.findOne({
                guild: g.id,
                command: c[1].name
            });

            const legacyPermission = {
                USER: CommandPermissions.User,
                ROLE: CommandPermissions.Role
            }

            if(permissions != null) fullPermissions.push({
                id: c[1].id,
                permissions: permissions.permissions.map(p => {
                    p.type = legacyPermission[p.type] || p.type;
                    return p;
                })
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
        ServerCache.emoji[e] = client.emojis.cache.get(Server.emoji[e]) || await guild.emojis.fetch(Server.emoji[e]);
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

    await music.setup(client);
});

client.on('interactionCreate', async interaction => {
    let user = await User.findOne({ id : interaction.user.id });
    let guild;
    if(interaction.guild) guild = await Guild.findOne({ id : interaction.guild.id });

    let locale = interaction.locale.substring(0, 2);
    if(!lang.getLangList().includes(locale)) locale = 'en';

    if(!user) {
        user = new User({
            id: interaction.user.id,
            lang: locale
        });
        await user.save();

        if(interaction.isChatInputCommand()) try {
            await interaction.channel.send(`${interaction.user}\n${lang.getFirstTimeString()}`);
        } catch (e) {}
        else if(!interaction.isAutocomplete()) try {
            await interaction.user.send(`${interaction.user}\n${lang.getFirstTimeString()}`);
        } catch (e) {}
    }
    if(!user.localeUpdated) {
        const changed = user.lang !== locale;

        user = await User.findOneAndUpdate({
            id: interaction.user.id
        }, {
            lang: locale,
            localeUpdated: true
        }, {
            new: true
        });

        if(changed) await interaction.user.send(lang.langByLangName(user.lang, 'LOCALE_CHANGED'));
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

    if(user.ephemaralOnly) {
        interaction.originalReply = interaction.reply;
        interaction.originalDeferReply = interaction.deferReply;

        interaction.reply = options => {
            if(typeof options === 'string') options = { content: options };
            options.ephemeral = true;

            return interaction.originalReply(options);
        }

        interaction.deferReply = options => {
            if(!options) options = {};
            options.ephemeral = true;

            return interaction.originalDeferReply(options);
        }
    }

    if(interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        if(!interaction.commandName) return;

        if(!interaction.guild
            && !interaction.dbUser.forceDMCommand
            && !dmAllowedCommands.includes(interaction.commandName)) return interaction.reply(
            lang.langByLangName(interaction.dbUser.lang, 'SERVER_ONLY')
        );

        if(commandHandler[interaction.commandName] != null) {
            const checkPermission = permissionHandler[interaction.commandName];
            if(checkPermission) {
                const check = await permissionHandler[interaction.commandName](interaction);
                if(!check) return;
            }
            commandHandler[interaction.commandName](interaction);
        }

        await CommandHistory.create({
            guild: interaction.guild?.id,
            channel: interaction.channel.id,
            user: interaction.user.id,
            command: interaction.toString(),
            commandName: interaction.commandName,
            options: interaction.options._hoistedOptions,
            subCommand: interaction.options.getSubcommand(false),
            subCommandGroup: interaction.options.getSubcommandGroup(false)
        });
    }

    if(interaction.isSelectMenu()) {
        const params = interaction.values[0].split('_');
        const handler = selectHandler[params[0]];
        if(handler) handler(interaction);

        await InteractionHistory.create({
            type: 'SELECT_MENU',
            guild: interaction.guild?.id,
            channel: interaction.channel.id,
            user: interaction.user.id,
            customId: interaction.customId,
            values: interaction.values
        });
    }

    if(interaction.isButton()) {
        const params = interaction.customId.split('_');
        const handler = buttonHandler[params[0]];
        if(handler) handler(interaction);

        await InteractionHistory.create({
            type: 'BUTTON',
            guild: interaction.guild?.id,
            channel: interaction.channel.id,
            user: interaction.user.id,
            customId: interaction.customId
        });
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

client.on('messageDelete', async message => {
    await Vote.deleteMany({
        message: message.id
    });

    await VoteOption.deleteMany({
        message: message.id
    });
});

client.on('guildDelete', async guild => {
    await Guild.deleteOne({
        id: guild.id
    });
});

client.on('debug', d => {
    if(debug) console.log(d);
});

process.on('uncaughtException', async e => {
    console.error(e);
    process.exit(1);

    const recentCommands = await CommandHistory.find().sort({
        _id: -1
    }).limit(3);
    let err = util.inspect(e, {
        depth: 1,
        colors: true
    });
    if(err.length > 4000) err = util.inspect(e, {
        depth: 1
    });
    const errMessage = {
        embeds: [
            new Embed()
                .setColor(0xff0000)
                .setTitle('오류 발생')
                .setDescription(`${err.length > 4000 ? '첨부파일 확인' : `\`\`\`ansi\n${err}\n\`\`\``}`)
                .addField({
                    name: '최근 명령어(최신순)',
                    value: `\`\`\`\n${recentCommands.map(a => a.command.substring(0, 330)).join('\n')}\n\`\`\``
                })
                .setTimestamp()
        ]
    }
    if(err.length > 4000) errMessage.files = [{
        attachment: Buffer.from(err),
        name: 'error.log'
    }];

    const users = await User.find({
        trackError: true
    });

    for(let u of users) {
        try {
            const user = await client.users.fetch(u.id);
            await user.send(errMessage);
        } catch(e) {
            console.log(e);
        }
    }
});

client.login(setting.TOKEN);