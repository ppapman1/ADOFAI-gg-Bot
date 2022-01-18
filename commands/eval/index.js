const main = require('../../main');
const utils = require('../../utils');

module.exports = {
    group: 'eval',
    info: {
        defaultPermission: false,
        name: 'eval',
        description: 'eval 관련 명령어들입니다.',
        options: [
            {
                name: 'create',
                description: 'eval 명령 설정을 생성합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'eval의 이름입니다.',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'info',
                description: 'eval의 정보를 확인합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'eval의 이름입니다.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            },
            {
                name: 'message',
                description: '간단한 eval 메시지를 전송합니다. 여러 버튼을 넣을 경우 ;로 구분합니다.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'eval의 이름입니다.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    },
                    {
                        name: 'message',
                        description: 'eval 메시지 내용입니다.',
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: 'buttontext',
                        description: '버튼에 들어갈 글자입니다.',
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: 'buttoncolor',
                        description: '버튼의 색입니다.',
                        type: 'STRING',
                        required: true,
                        choices: [
                            {
                                name: '파란색+보라색',
                                value: 'PRIMARY'
                            },
                            {
                                name: '회색',
                                value: 'SECONDARY'
                            },
                            {
                                name: '초록색',
                                value: 'SUCCESS'
                            },
                            {
                                name: '빨간색',
                                value: 'DANGER'
                            }
                        ]
                    },
                    {
                        name: 'params',
                        description: '버튼에 들어갈 추가 파라미터입니다.',
                        type: 'STRING'
                    },
                    {
                        name: 'buttoncolors',
                        description: '여러 버튼을 넣을 경우 버튼의 색을 ;로 구분합니다. 1~4 숫자로 입력하며, 파란색+보라색, 회색, 초록색, 빨간색 순입니다.',
                        type: 'STRING'
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
    handler: utils.subCommandHandler('eval'),
    autoCompleteHandler: utils.autoCompleteHandler('eval')
}