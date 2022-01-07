const { MessageEmbed , Util } = require('discord.js');

const { getCommandDescription } = require('../../lang');
const utils = require('../../utils');

const Guild = require('../../schemas/guild');
const Todo = require('../../schemas/todo');
const lang = require('../../lang');

let client;

const getListMessage = async (guild, event, language = 'ko', fetchedEvent) => {
    if(!fetchedEvent) {
        const fetchedGuild = await client.guilds.fetch(guild);
        fetchedEvent = await fetchedGuild.scheduledEvents.fetch(event);
    }

    const checkTodo = await Todo.find({
        guild,
        event
    });

    return {
        embeds: [
            new MessageEmbed()
                .setColor('#349eeb')
                .setTitle(`${fetchedEvent.name} ${lang.langByLangName(language, 'TODO_LIST_TITLE')}`)
                .setDescription(checkTodo.length ? checkTodo.map((a, i) => `**${i + 1}**. ${Util.escapeMarkdown(a.todo)}`).join('\n') : lang.langByLangName(language, 'TODO_LIST_EMPTY'))
                .setTimestamp()
        ]
    };
}

module.exports = {
    group: 'devserver',
    info: {
        defaultPermission: false,
        name: 'todo',
        description: getCommandDescription('TODO_DESCRIPTION'),
        options: [
            {
                name: 'create',
                description: getCommandDescription('TODO_CREATE_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'target',
                        description: getCommandDescription('TODO_CREATE_TARGET_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    },
                    {
                        name: 'todo',
                        description: getCommandDescription('TODO_CREATE_TODO_DESCRIPTION'),
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'delete',
                description: getCommandDescription('TODO_DELETE_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'target',
                        description: getCommandDescription('TODO_CREATE_TARGET_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    },
                    {
                        name: 'num',
                        description: getCommandDescription('TODO_DELETE_NUM_DESCRIPTION'),
                        type: 'INTEGER',
                        min_value: 1,
                        required: true
                    }
                ]
            },
            {
                name: 'list',
                description: getCommandDescription('TODO_LIST_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'target',
                        description: getCommandDescription('TODO_CREATE_TARGET_DESCRIPTION'),
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'setchannel',
                description: getCommandDescription('TODO_SETCHANNEL_DESCRIPTION'),
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'channel',
                        description: getCommandDescription('TODO_SETCHANNEL_CHANNEL_DESCRIPTION'),
                        type: 'CHANNEL',
                        channel_types: [ 0 , 5 ],
                        required: true
                    }
                ]
            }
        ]
    },
    handler: utils.subCommandHandler('todo'),
    autoCompleteHandler: async interaction => {
        const events = await interaction.guild.scheduledEvents.cache;

        const target = interaction.options.getString('target');
        const targetRegex = new RegExp(utils.escapeRegExp(target), 'i');

        return interaction.respond(Array.from(events.filter(e => targetRegex.test(e.name)).values()).slice(0, 25).map(e => ({
            name: e.name,
            value: e.id
        })));
    },
    setup: async c => {
        client = c;

        client.on('guildScheduledEventUpdate', async (before, event) => {
            if(!before?.isActive() && event.isActive()) {
                const dbGuild = await Guild.findOne({
                    id: event.guild.id
                });
                if(!dbGuild || !dbGuild.features.includes('devserver') || !dbGuild.todoNoticeChannel) return;

                let channel;
                try {
                    channel = await event.guild.channels.fetch(dbGuild.todoNoticeChannel);
                } catch(e) {
                    return;
                }

                const msg = await getListMessage(event.guild, event.id, 'ko', event);
                return channel.send(msg);
            }
            if(event.isCompleted()) await Todo.deleteMany({
                guild: event.guild.id,
                event: event.id
            });
        });

        client.on('guildScheduledEventDelete', async event => {
            await Todo.deleteMany({
                guild: event.guild.id,
                event: event.id
            });
        });
    },
    getListMessage
}