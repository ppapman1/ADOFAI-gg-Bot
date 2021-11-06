const { MessageActionRow , MessageButton } = require('discord.js');

const utils = require("../../utils");

const Eval = require("../../schemas/eval");

module.exports.commandHandler = async interaction => {
    const { options } = interaction;

    const name = options.getString('name');
    const content = options.getString('message').split('///').join('\n');
    const buttonText = options.getString('buttontext');
    const buttonColor = options.getString('buttoncolor');
    const customParams = options.getString('params');

    const nameRegex = new RegExp(utils.escapeRegExp(name), 'i');

    const eval = await Eval.findOne({
        name: {
            $regex: nameRegex
        }
    });
    if(!eval) return interaction.reply('해당 eval을 찾을 수 없습니다.');

    await interaction.channel.send({
        content,
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`eval_run_${eval.id}${customParams ? `_${customParams}` : ''}`)
                        .setLabel(buttonText)
                        .setStyle(buttonColor)
                )
        ]
    });

    return interaction.reply({
        content: 'eval 메시지를 전송했습니다.',
        ephemeral: true
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

    return interaction.respond(evals.map(e => ({
        name: e.name,
        value: e.name
    })));
}