const lang = require('../../lang');

const User = require('../../schemas/user');

module.exports = async interaction => {
    await interaction.deferReply({
        ephemeral: true
    });

    const user = interaction.options.getUser('user');

    await User.updateOne({ id : user.id }, {
        blacklist: false
    });

    return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'BLACKLIST_USER_REMOVED')
        .replace('{user}', user.tag));
}