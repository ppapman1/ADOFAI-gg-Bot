const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const uniqueString = require('unique-string');

const utils = require('./utils');

const User = require('./schemas/user');
const Warn = require('./schemas/warn');

let client, ServerCache;

const dmTemplate = (type, duration, reason) => `
You have been ${type.en} for ${duration >= Number.MAX_SAFE_INTEGER ? 'forever' : utils.msToTime(duration, true)} because of "${reason}", to appeal please send message here.
If you cant DM here for whatever reason, please create a new Discord server and invite ${reason} with [link](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands). 

당신은 이 서버에서 ${duration >= Number.MAX_SAFE_INTEGER ? '영구적으로' : utils.msToTime(duration) + '동안'} "${reason}"(으)로 ${type.ko}되었습니다. 이의제기를 하려면 여기에 DM을 보내 주세요.
만약 DM이 보내지지 않는다면, 자신의 서버를 새로 만든 다음 [이 링크](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)를 사용하여 ${client.user}를 자신의 서버에 초대해 DM을 보내 주세요. 
`.trim();

module.exports.setup = (c, s) => {
    client = c;
    ServerCache = s;

    setInterval(async () => {
        const unbanUsers = await User.find({
            unbanAt: { $lt : Date.now() }
        });

        for(let u of unbanUsers) await module.exports.unban(u.id, '차단 기간 만료 / Automatic timer action');

        const moreMuteUsers = await User.find({
            unmuteAt: { $gte : Date.now() + 1000 * 60 * 60 * 24 * 28 }
        });

        for(let u of moreMuteUsers) {
            const member = await ServerCache.adofai_gg.members.fetch(u.id);
            if(member.moderatable) await member.timeout(Math.min(u.unmuteAt - Date.now(), 1000 * 60 * 60 * 24 * 28));
        }
    }, process.argv[2] === '--debug' ? 5000 : 30000);
}

module.exports.mute = async (id, reason = 'No Reason', muteLength = Number.MAX_SAFE_INTEGER, moderatorId, stack = false, silent = false) => {
    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    const member = await ServerCache.adofai_gg.members.fetch(user.id);
    if(member && !member.moderatable) return;

    await member.timeout(Math.min(muteLength, 1000 * 60 * 60 * 24 * 28), reason);

    const checkUser = await User.findOne({ id : user.id });

    if(stack && checkUser.unmuteAt > 0) await User.updateOne({ id : user.id }, {
        $inc: { unmuteAt : muteLength }
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });
    else await User.updateOne({ id : user.id }, {
        unmuteAt: muteLength + Date.now()
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });

    if(!silent) await ServerCache.channel.modLogs.send({
        embeds: [
            new MessageEmbed()
                .setColor('#ff470f')
                .setAuthor(`Mute | ${user.tag}`, user.avatarURL())
                .addFields(
                    {
                        name: 'User',
                        value: user.toString(),
                        inline: true
                    },
                    {
                        name: 'Moderator',
                        value: moderator ? moderator.toString() : client.user.toString(),
                        inline: true
                    },
                    {
                        name: 'Length',
                        value: muteLength >= Number.MAX_SAFE_INTEGER ? 'Forever' : ((muteLength < 0 ? 'Remove ' : '') + (utils.msToTime(Math.abs(muteLength), true)) + (stack ? '(stack)' : '')),
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason.toString()
                    }
                )
                .setTimestamp()
                .setFooter(`ID: ${user.id}`)
        ]
    });

    if(!silent) try {
        if(muteLength > 0) await user.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#ff470f')
                    .setDescription(dmTemplate({
                        ko: '뮤트',
                        en: 'muted'
                    }, muteLength, reason))
            ]
        });
    } catch (e) {}
}

module.exports.unmute = async (id, reason = 'No Reason', moderatorId) => {
    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    const member = await ServerCache.adofai_gg.members.fetch(user.id);
    await member.timeout(0);

    await User.updateOne({ id : user.id }, {
        unmuteAt: null
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });

    const embeds = [
        new MessageEmbed()
            .setColor('#43b581')
            .setAuthor(`Unmute | ${user.tag}`, user.avatarURL())
            .addFields(
                {
                    name: 'User',
                    value: user.toString(),
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: moderator ? moderator.toString() : client.user.toString(),
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason.toString(),
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter(`ID: ${user.id}`)
    ]

    await ServerCache.channel.modLogs.send({
        embeds
    });

    try {
        await user.send({
            embeds
        });
    } catch (e) {}
}

module.exports.kick = async (id, reason = 'No Reason', moderatorId) => {
    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    const member = await ServerCache.adofai_gg.members.fetch(user.id);
    if(!member.kickable) return;

    const embeds = [
        new MessageEmbed()
            .setColor('#f04947')
            .setAuthor(`Kick | ${user.tag}`, user.avatarURL())
            .addFields(
                {
                    name: 'User',
                    value: user.toString(),
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: moderator ? moderator.toString() : client.user.toString(),
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason
                }
            )
            .setTimestamp()
            .setFooter(`ID: ${user.id}`)
    ]

    await ServerCache.channel.modLogs.send({
        embeds
    });

    try {
        await user.send({
            embeds
        });
    } catch (e) {}

    await member.kick(reason);
}

module.exports.ban = async (id, reason = 'No Reason', banLength = Number.MAX_SAFE_INTEGER, moderatorId, stack = false, deleteDays = 0) => {
    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    let member;
    try {
        member = await ServerCache.adofai_gg.members.fetch(user.id);
    } catch(e) {}
    if(member && !member.bannable) return;

    const checkUser = await User.findOne({ id });

    if(stack && checkUser.unbanAt > 0) await User.updateOne({ id }, {
        $inc: { unbanAt : banLength }
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });
    else await User.updateOne({ id }, {
        unbanAt: banLength + Date.now()
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });

    await ServerCache.channel.modLogs.send({
        embeds: [
            new MessageEmbed()
                .setColor('#f04947')
                .setAuthor(`Ban | ${user.tag}`, user.avatarURL())
                .addFields(
                    {
                        name: 'User',
                        value: user.toString(),
                        inline: true
                    },
                    {
                        name: 'Moderator',
                        value: moderator ? moderator.toString() : client.user.toString(),
                        inline: true
                    },
                    {
                        name: 'Length',
                        value: banLength >= Number.MAX_SAFE_INTEGER ? 'Forever' : ((banLength < 0 ? 'Remove ' : '') + (utils.msToTime(Math.abs(banLength), true)) + (stack ? '(stack)' : '')),
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason
                    }
                )
                .setTimestamp()
                .setFooter(`ID: ${user.id}`)
        ]
    });

    try {
        if(banLength > 0) await user.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#f04947')
                    .setDescription(dmTemplate({
                        ko: '밴',
                        en: 'banned'
                    }, banLength, reason))
            ]
        });
    } catch (e) {}

    await ServerCache.adofai_gg.bans.create(id, {
        reason,
        days: deleteDays
    });
}

module.exports.unban = async (id, reason = 'No Reason', moderatorId) => {
    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    await ServerCache.adofai_gg.bans.remove(user.id);

    await User.updateOne({ id : user.id }, {
        unbanAt: null
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });

    const embeds = [
        new MessageEmbed()
            .setColor('#fada5e')
            .setAuthor(`Unban | ${user.tag}`, user.avatarURL())
            .addFields(
                {
                    name: 'User',
                    value: user.toString(),
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: moderator ? moderator.toString() : client.user.toString(),
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter(`ID: ${user.id}`)
    ]

    await ServerCache.channel.modLogs.send({
        embeds
    });

    try {
        await user.send({
            embeds
        });
    } catch (e) {}
}

module.exports.warn = async (id, reason = 'No Reason', moderatorId, count = 1, silent = false, group) => {
    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    const newWarn = new Warn({
        id: uniqueString(),
        user: user.id,
        createdAt: Date.now(),
        reason,
        moderator: moderatorId || client.user.id
    });
    await newWarn.save();

    if(group) await Warn.updateOne({
        id: group
    }, {
        $push: {
            group: newWarn.id
        }
    });

    const embeds = [
        new MessageEmbed()
            .setColor('#fada5e')
            .setAuthor(`Warn | ${user.tag}`, user.avatarURL())
            .addFields(
                {
                    name: 'User',
                    value: user.toString(),
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: moderator ? moderator.toString() : client.user.toString(),
                    inline: true
                },
                {
                    name: 'Amount',
                    value: count.toString(),
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason
                }
            )
            .setTimestamp()
            .setFooter(`ID: ${user.id}`)
    ]

    if(!silent) await ServerCache.channel.modLogs.send({
        embeds,
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`askUnwarn_${newWarn.id}`)
                        .setLabel('취소 | Cancel')
                        .setStyle('DANGER')
                )
        ]
    });

    if(!silent) try {
        await user.send({
            embeds
        });
    } catch (e) {}

    const warnCount = await Warn.countDocuments({
        user: user.id,
        createdAt: { $gt : Date.now() - (1000 * 60 * 60 * 24 * 60) }
    });
    if(warnCount >= 3) await module.exports.mute(user.id, `${warnCount} warns`, warnCount < 10 ? 86400000 * warnCount * 2 : Number.MAX_SAFE_INTEGER, null, true);

    if(count > 1) await module.exports.warn(user.id, reason, moderatorId, count - 1, true, group || newWarn.id);
}

module.exports.unwarn = async (warnId, moderatorId) => {
    const warn = await Warn.findOneAndDelete({ id : warnId });
    if(!warn) return;

    const user = await client.users.fetch(warn.user);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    const embeds = [
        new MessageEmbed()
            .setColor('#43b581')
            .setAuthor(`Unwarn | ${user.tag}`, user.avatarURL())
            .addFields(
                {
                    name: 'User',
                    value: user.toString(),
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: moderator ? moderator.toString() : client.user.toString(),
                    inline: true
                },
                {
                    name: 'Reason',
                    value: warn.reason,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter(`ID: ${user.id}`)
    ]

    await ServerCache.channel.modLogs.send({
        embeds
    });

    try {
        await user.send({
            embeds
        });
    } catch (e) {}

    const warnCount = await Warn.countDocuments({
        user: user.id,
        createdAt: { $gt : Date.now() - (1000 * 60 * 60 * 24 * 60) }
    });
    const beforeWarnCount = warnCount + 1;

    if(beforeWarnCount >= 3) await module.exports.mute(user.id, `Cancel warning`, (beforeWarnCount < 10 ? 86400000 * beforeWarnCount * 2 : Number.MAX_SAFE_INTEGER) * -1, null, true);

    if(warn.group?.length) for(let w of warn.group) await module.exports.unwarn(w, moderatorId);
}