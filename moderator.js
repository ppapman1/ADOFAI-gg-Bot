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

        for(let u of unbanUsers) await module.exports.unban({
            user: u.id,
            reason: '차단 기간 만료 / Automatic timer action'
        });

        const moreMuteUsers = await User.find({
            unmuteAt: { $gte : Date.now() + 1000 * 60 * 60 * 24 * 28 }
        });

        for(let u of moreMuteUsers) {
            let member;
            try {
                member = await ServerCache.adofai_gg.members.fetch(u.id);
            } catch(e) {
                continue;
            }
            if(!member.communicationDisabledUntilTimestamp) member = await ServerCache.adofai_gg.members.fetch({
                user: u.id,
                force: true
            });
            if(member.moderatable
                && (member.communicationDisabledUntilTimestamp - Date.now() || 0) <= 1000 * 60 * 60 * 24 * 21) await member.timeout(Math.min(u.unmuteAt - Date.now(), 1000 * 60 * 60 * 24 * 28));
        }
    }, process.argv[2] === '--debug' ? 5000 : 30000);
}

module.exports.mute = async (options = {
    user,
    reason: 'No Reason',
    duration: Number.MAX_SAFE_INTEGER,
    moderator,
    stack: false,
    silent: false,
    evidence
}) => {
    const {
        user: id,
        reason,
        duration: muteLength,
        moderator: moderatorId,
        stack,
        silent,
        evidence
    } = options;

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

    const embed = new MessageEmbed()
        .setColor('#ff470f')
        .setAuthor({
            name: `Mute | ${user.tag}`,
            iconURL: user.avatarURL()
        })
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
        .setFooter({
            text: `ID: ${user.id}`
        });

    if(evidence) embed.setImage(evidence);

    if(!silent) await ServerCache.channel.modLogs.send({
        embeds: [embed]
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

module.exports.unmute = async (options = {
    user,
    reason: 'No Reason',
    moderator,
    evidence
}) => {
    const {
        user: id,
        reason,
        moderator: moderatorId,
        evidence
    } = options;

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

    const embed = new MessageEmbed()
        .setColor('#43b581')
        .setAuthor({
            name: `Unmute | ${user.tag}`,
            iconURL: user.avatarURL()
        })
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
        .setFooter({
            text: `ID: ${user.id}`
        });

    if(evidence) embed.setImage(evidence);

    await ServerCache.channel.modLogs.send({
        embeds: [embed]
    });

    try {
        await user.send({
            embeds: [embed]
        });
    } catch (e) {}
}

module.exports.kick = async (options = {
    user,
    reason: 'No Reason',
    moderator,
    evidence
}) => {
    const {
        user: id,
        reason,
        moderator: moderatorId,
        evidence
    } = options;

    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    const member = await ServerCache.adofai_gg.members.fetch(user.id);
    if(!member.kickable) return;

    const embed = new MessageEmbed()
        .setColor('#f04947')
        .setAuthor({
            name: `Kick | ${user.tag}`,
            iconURL: user.avatarURL()
        })
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
        .setFooter({
            text: `ID: ${user.id}`
        });

    if(evidence) embed.setImage(evidence);

    await ServerCache.channel.modLogs.send({
        embeds: [embed]
    });

    try {
        await user.send({
            embeds: [embed]
        });
    } catch (e) {}

    await member.kick(reason);
}

module.exports.ban = async (options = {
    user,
    reason: 'No Reason',
    duration: Number.MAX_SAFE_INTEGER,
    moderator,
    stack: false,
    deleteDays: 0,
    evidence
}) => {
    const {
        user: id,
        reason,
        duration: banLength,
        moderator: moderatorId,
        stack,
        deleteDays,
        evidence
    } = options;

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
    
    const embed = new MessageEmbed()
        .setColor('#f04947')
        .setAuthor({
            name: `Ban | ${user.tag}`,
            iconURL: user.avatarURL()
        })
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
        .setFooter({
            text: `ID: ${user.id}`
        });
    
    if(evidence) embed.setImage(evidence);

    await ServerCache.channel.modLogs.send({
        embeds: [embed]
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

module.exports.unban = async (options = {
    user,
    reason: 'No Reason',
    moderator,
    evidence
}) => {
    const {
        user: id,
        reason,
        moderator: moderatorId,
        evidence
    } = options;

    const user = await client.users.fetch(id);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    await ServerCache.adofai_gg.bans.remove(user.id);

    await User.updateOne({ id : user.id }, {
        unbanAt: null
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });

    const embed = new MessageEmbed()
        .setColor('#fada5e')
        .setAuthor({
            name: `Unban | ${user.tag}`,
            iconURL: user.avatarURL()
        })
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
        .setFooter({
            text: `ID: ${user.id}`
        });

    if(evidence) embed.setImage(evidence);

    await ServerCache.channel.modLogs.send({
        embeds: [embed]
    });

    try {
        await user.send({
            embeds: [embed]
        });
    } catch (e) {}
}

module.exports.warn = async (options = {
    user,
    reason: 'No Reason',
    moderator,
    amount: 1,
    silent: false,
    group,
    evidence
}) => {
    const {
        user: id,
        reason,
        moderator: moderatorId,
        amount: count,
        silent,
        group,
        evidence
    } = options;

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

    const embed = new MessageEmbed()
        .setColor('#fada5e')
        .setAuthor({
            name: `Warn | ${user.tag}`,
            iconURL: user.avatarURL()
        })
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
        .setFooter({
            text: `ID: ${user.id}`
        });

    if(evidence) embed.setImage(evidence);

    if(!silent) await ServerCache.channel.modLogs.send({
        embeds: [embed],
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
            embeds: [embed]
        });
    } catch (e) {}

    const warnCount = await Warn.countDocuments({
        user: user.id,
        createdAt: { $gt : Date.now() - (1000 * 60 * 60 * 24 * 60) }
    });
    if(warnCount >= 3) await module.exports.mute({
        user: user.id,
        reason: `${warnCount} warns`,
        duration: warnCount < 10 ? 86400000 * warnCount * 2 : Number.MAX_SAFE_INTEGER,
        stack: true
    });

    if(count > 1) await module.exports.warn({
        user: user.id,
        reason,
        moderator: moderatorId,
        count: count - 1,
        silent: true,
        group: group || newWarn.id
    });
}

module.exports.unwarn = async (options = {
    warn,
    moderator
}) => {
    const {
        warn: warnId,
        moderator: moderatorId
    } = options;

    const warn = await Warn.findOneAndDelete({ id : warnId });
    if(!warn) return;

    const user = await client.users.fetch(warn.user);
    const moderator = moderatorId ? await client.users.fetch(moderatorId) : null;

    const embed = new MessageEmbed()
        .setColor('#43b581')
        .setAuthor({
            name: `Unwarn | ${user.tag}`,
            iconURL: user.avatarURL()
        })
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
        .setFooter({
            text: `ID: ${user.id}`
        });

    await ServerCache.channel.modLogs.send({
        embeds: [embed]
    });

    try {
        await user.send({
            embeds: [embed]
        });
    } catch (e) {}

    const warnCount = await Warn.countDocuments({
        user: user.id,
        createdAt: { $gt : Date.now() - (1000 * 60 * 60 * 24 * 60) }
    });
    const beforeWarnCount = warnCount + 1;

    if(beforeWarnCount >= 3) await module.exports.mute({
        user: user.id,
        reason: 'Cancel warning',
        duration: (beforeWarnCount < 10 ? 86400000 * beforeWarnCount * 2 : Number.MAX_SAFE_INTEGER) * -1,
        stack: true
    });

    if(warn.group?.length) for(let w of warn.group) await module.exports.unwarn({
        warn: w,
        moderator: moderatorId
    });
}