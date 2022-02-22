const { Util , ActionRow , ButtonComponent, ButtonStyle } = require('discord.js');

const utils = require('../../utils');

const Eval = require('../../schemas/eval');

module.exports.commandHandler = async interaction => {
    const name = interaction.options.getString('name');
    // const nameRegex = new RegExp(utils.escapeRegExp(name), 'i');

    const eval = await Eval.findOne({
        name
    });
    if(!eval) return interaction.reply('해당 eval을 찾을 수 없습니다.');

    return interaction.reply({
        content: `\`${Util.escapeCodeBlock(eval.name)}\` Code\n\`\`\`js\n${Util.escapeCodeBlock(eval.code)}\`\`\`\nID : \`${eval.id}\``,
        components: [
            new ActionRow()
                .addComponents(
                    new ButtonComponent()
                        .setCustomId(`eval_delete_${eval.id}`)
                        .setLabel('삭제')
                        .setStyle(ButtonStyle.Danger)
                )
        ]
    });
}

module.exports.autoCompleteHandler = async interaction => {
    const name = interaction.options.getString('name');
    const nameRegex = new RegExp(utils.escapeRegExp(name), 'i');

    const evals = await Eval.find({
        name: {
            $regex: nameRegex
        }
    });

    return interaction.respond(evals.slice(0, 25).map(e => ({
        name: e.name,
        value: e.name
    })));
}