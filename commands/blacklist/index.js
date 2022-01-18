const main = require("../../main");
const utils = require('../../utils');

module.exports = {
    info: {
        name: 'blacklist',
        description: '블랙리스트 관련 명령어입니다. // It\'s a blacklist related command.',
        options: [
            {
                name: 'add',
                description: '블랙리스트에 유저를 추가합니다. // Add a user to the blacklist.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'user',
                        description: '추가할 유저입니다. // It\'s a user to add.',
                        type: 'USER',
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: '블랙리스트에서 유저를 제거합니다. // Remove the user from the blacklist.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'user',
                        description: '제거할 유저입니다. // It\'s a user to remove.',
                        type: 'USER',
                        required: true
                    }
                ]
            }
        ]
    },
    checkPermission: async interaction => {
        if(main.getTeamOwner() !== interaction.user.id) {
            await interaction.reply('🤔');
            return false;
        }

        return true;
    },
    handler: utils.subCommandHandler('blacklist')
}