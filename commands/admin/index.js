const fs = require('fs');

const permissions = require('../../permissions');
const lang = require('../../lang');
const main = require('../../main');
const utils = require('../../utils');

module.exports = {
    info: {
        name: 'admin',
        description: '봇 관리자 전용 명령어입니다. // This is a bot manager-only command.',
        options: [
            {
                name: 'clearcommand',
                description: '디스코드 애플리케이션에 등록된 슬래시 커맨드를 모두 삭제합니다. 봇 재시작이 필요합니다.',
                type: 'SUB_COMMAND'
            },
            {
                name: 'trackerror',
                description: '봇의 오류 트래킹 DM을 토글합니다.',
                type: 'SUB_COMMAND'
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
    handler: utils.subCommandHandler('admin')
}