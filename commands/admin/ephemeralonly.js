const User = require('../../schemas/user');

module.exports = async interaction => {
    await User.updateOne({
        id: interaction.user.id
    }, {
        ephemaralOnly: !interaction.dbUser.ephemaralOnly
    });

    return interaction.reply({
        content: `이제 모든 명령어 결과가 ephemeral로 표시${interaction.dbUser.ephemaralOnly ? '되지 않습' : '됩'}니다!`,
        ephemeral: true
    });
}