const {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource,
    demuxProbe,
    AudioPlayerStatus
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const Guild = require('./schemas/guild');
const MusicQueue = require('./schemas/musicQueue');

const Player = {};

module.exports.setup = async client => {
    for(let v of client.guilds.cache.map(g => g.me.voice.channel).filter(a => a)) {
        await module.exports.connect(v);
        await module.exports.start(v.guild);
        
        console.log(v.name);
    }
}

module.exports.connect = async (voiceChannel, textChannel) => {
    if(voiceChannel.constructor.name !== 'VoiceChannel') return;

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    Player[voiceChannel.guild.id] = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
        }
    });

    const player = Player[voiceChannel.guild.id];

    player.on(AudioPlayerStatus.Idle, async () => {
        await MusicQueue.deleteOne({
            guild: voiceChannel.guild.id
        });
        const nextTrack = await MusicQueue.findOne({
            guild: voiceChannel.guild.id
        });
        if(!nextTrack) return module.exports.disconnect(voiceChannel.guild);

        await module.exports.play(voiceChannel.guild, nextTrack.url);

        const guild = await Guild.findOne({
            id: voiceChannel.guild.id
        });
        if(!guild || !guild.musicCommandChannel) return;

        const channel = voiceChannel.client.channels.cache.get(guild.musicCommandChannel);
        if(!channel) return;

        return channel.send(`Now playing: **${nextTrack.title}**`);
    });

    player.on('error', async () => {
        module.exports.skip(voiceChannel.guild);
    });

    connection.subscribe(Player[voiceChannel.guild.id]);

    if(textChannel && textChannel.constructor.name === 'TextChannel') await Guild.updateOne({
        id: textChannel.guild.id
    }, {
        musicCommandChannel: textChannel.id
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });
}

module.exports.disconnect = guild => {
    if(guild.constructor.name !== 'Guild') return;

    const connection = getVoiceConnection(guild.id);
    if(connection) connection.destroy();

    Player[guild.id].stop();
    delete Player[guild.id];
}

module.exports.play = async (guild, url) => {
    if(guild.constructor.name !== 'Guild') return;

    const audio = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        format: 'webm',
        highWaterMark: 1 << 25
    });
    const info = await ytdl.getInfo(url);

    const probe = await demuxProbe(audio);

    const resource = createAudioResource(probe.stream, {
        metadata: {
            name: info.videoDetails.title
        },
        inputType: probe.type
    });

    Player[guild.id].play(resource);
}

module.exports.start = async guild => {
    const checkQueue = await MusicQueue.findOne({
        guild: guild.id
    });
    if(!checkQueue) return;

    return module.exports.play(guild, checkQueue.url);
}

module.exports.pause = guild => {
    if(guild.constructor.name !== 'Guild') return;

    Player[guild.id].pause();
}

module.exports.resume = guild => {
    if(guild.constructor.name !== 'Guild') return;

    Player[guild.id].unpause();
}

module.exports.search = async (query, limit = 5) => {
    const filter = await ytsr.getFilters(query);
    const result = await ytsr(filter.get('Type').get('Video').url, {
        limit
    });

    return result.items;
}

module.exports.addQueue = async (guild, user, url) => {
    if(guild.constructor.name !== 'Guild') return;

    const info = await ytdl.getInfo(url);

    await MusicQueue.create({
        guild: guild.id,
        url,
        title: info.videoDetails.title,
        createdUser: user.id,
        startedAt: 0
    });

    const count = await MusicQueue.countDocuments({
        guild: guild.id
    });
    if(count === 1) return module.exports.start(guild);
}

module.exports.skip = guild => {
    if(guild.constructor.name !== 'Guild') return;

    Player[guild.id].stop();
}

module.exports.getPlayer = guild => {
    if(guild.constructor.name !== 'Guild') return;

    return Player[guild.id];
}