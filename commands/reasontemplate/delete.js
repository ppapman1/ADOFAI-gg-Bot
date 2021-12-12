const utils = require('../../utils');
const lang = require('../../lang');

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
    if(!deleted) return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'TEMPLATE_NOT_FOUND'));

    return interaction.reply(lang.langByLangName(interaction.dbUser.lang, 'TEMPLATE_DELETED_MESSAGE')
        .replace('{type}', templateType.find(a => a.value === type).name)
        .replace('{reason}', deleted.reason)
    );
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
    }).limit(25);
    if(!template.length) return interaction.respond([]);

    return interaction.respond(template.map(a => ({
        name: a.reason,
        value: a.reason
    })));
}