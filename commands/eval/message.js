const { ActionRow , ButtonComponent , Util } = require('discord.js');

const utils = require("../../utils");

const Eval = require("../../schemas/eval");

module.exports.commandHandler = async interaction => {
    const { options } = interaction;

    const name = options.getString('name').split(';');
    const content = options.getString('message');
    // const content = options.getString('message').split('///').join('\n');
    const buttonText = options.getString('buttontext').split(';');
    const buttonColor = options.getString('buttoncolor');
    const customParams = options.getString('params')?.split(';') || [];
    const buttonColors = options.getString('buttoncolors')?.split(';') || [];
    const role = options.getRole('role');

    const buttonColorMap = [
        'PRIMARY',
        'SECONDARY',
        'SUCCESS',
        'DANGER'
    ];

    const components = [];
    let buttons = [];
    for(let i in buttonText) {
        i = Number(i);

        const thisName = name[Math.min(i, name.length - 1)];
        const nameRegex = new RegExp(utils.escapeRegExp(thisName), 'i');

        let eval = await Eval.findOne({
            name: thisName
        });
        if(!eval) eval = await Eval.findOne({
            name: {
                $regex: nameRegex
            }
        });
        if(!eval) return interaction.reply('해당 eval을 찾을 수 없습니다.');

        if(buttons.length >= 5) {
            components.push(
                new ActionRow()
                    .addComponents(...buttons)
            );
            buttons = [];
        }

        const customParam = customParams[Math.min(i, customParams.length - 1)];
        const buttonColorNum = Number(buttonColors[Math.min(i, buttonColors.length - 1)]);
        buttons.push(
            new ButtonComponent()
                .setCustomId(`eval_run${role ? `:${role.id}` : ''}_${eval.id}${customParam ? `_${customParam}` : ''}`)
                .setLabel(buttonText[i])
                .setStyle(buttonColorMap[buttonColorNum - 1] || buttonColor)
        );
    }

    if(buttons.length) components.push(
        new ActionRow()
            .addComponents(...buttons)
    );

    try {
        await interaction.channel.send({
            content,
            components
        });

        return interaction.reply({
            content: 'eval 메시지를 전송했습니다.',
            ephemeral: true
        });
    } catch(e) {
        return interaction.reply({
            content: `\`\`\`js\n${Util.escapeCodeBlock(e.toString())}\`\`\``,
            ephemeral: true
        });
    }
}

module.exports.autoCompleteHandler = async interaction => {
    const names = interaction.options.getString('name').split(';');
    const nameRegex = new RegExp(utils.escapeRegExp(names.at(-1)), 'i');

    const evals = await Eval.find({
        name: {
            $regex: nameRegex
        }
    });

    const getAutoComplete = e => {
        names[names.length - 1] = e.name;
        return names.join(';');
    };

    return interaction.respond(evals.slice(0, 25).map(e => ({
        name: getAutoComplete(e),
        value: getAutoComplete(e)
    })));
}