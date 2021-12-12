const utils = require('../../utils');

const ReasonTemplate = require('../../schemas/reasonTemplate');

const templateType = require('./templateType');

module.exports.commandHandler = async interaction => {
    const { options } = interaction;

    const type = options.getString('type');
    const reason = options.getString('reason');
    const reasonRegex = new RegExp(utils.escapeRegExp(reason), 'i');

    const deleted = await ReasonTemplate.findOneAndRemove({
        type,
        reason: {
            $regex: reasonRegex
        }
    });
    if(!deleted) return interaction.reply('해당 템플릿을 찾을 수 없습니다.');

    return interaction.reply(`"${templateType.find(a => a.value === type).name}"용 "${deleted.reason}" 템플릿이 삭제되었습니다.`);
}

module.exports.autoCompleteHandler = async interaction => {
    const { options } = interaction;

    const type = options.getString('type');
    const reason = options.getString('reason');
    const reasonRegex = new RegExp(utils.escapeRegExp(reason), 'i');

    const template = await ReasonTemplate.find({
        type,
        reason: {
            $regex: reasonRegex
        }
    });
    if(!template.length) return interaction.respond([]);

    return interaction.respond(template.map(a => ({
        name: a.reason,
        value: a.reason
    })));
}