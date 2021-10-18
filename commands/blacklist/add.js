const lang = require('../../lang');

const User = require('../../schemas/user');

module.exports = async interaction => {
    await interaction.deferReply({
        ephemeral: true
    });

    const user = interaction.options.getUser('user');

    await User.updateOne({ id : user.id }, {
        blacklist: true
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });

    return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'BLACKLIST_USER_ADDED')
        .replace('{user}', user.tag));
}