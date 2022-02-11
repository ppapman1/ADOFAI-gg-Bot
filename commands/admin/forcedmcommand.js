const User = require('../../schemas/user');

module.exports = async interaction => {
    await User.updateOne({
        id: interaction.user.id
    }, {
        trackError: !interaction.dbUser.forceDMCommand
    });

    return interaction.reply({
        content: `이제 모든 명령어를 DM에서 사용할 수 ${interaction.dbUser.forceDMCommand ? '없' : '있'}습니다!`,
        ephemeral: true
    });
}