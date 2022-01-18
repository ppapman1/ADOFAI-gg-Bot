const permission = require('../../permissions');
const utils = require('../../utils');

const typeChoices = require('./templateType');

module.exports = {
    private: true,
    permissions: permission.staffOnly,
    info: {
        defaultPermission: false,
        name: 'reasontemplate',
        description: '서버 처벌 사유 템플릿 관련 명령어입니다. // This is an command related to the server punishment reason template.',
        options: [
            {
                name: 'create',
                description: '서버 처벌 사유 템플릿을 생성합니다. // Create a punishment reason template.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'type',
                        description: '생성할 템플릿의 종류를 선택합니다. // Select the type of template you want to create.',
                        type: 'STRING',
                        required: true,
                        choices: typeChoices
                    },
                    {
                        name: 'reason',
                        description: '생성할 템플릿의 사유를 입력합니다. // Enter the reason of the template you want to create.',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'delete',
                description: '서버 처벌 사유 템플릿을 삭제합니다. // Delete a punishment reason template.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'type',
                        description: '삭제할 템플릿의 종류를 선택합니다. // Select the type of template you want to delete.',
                        type: 'STRING',
                        required: true,
                        choices: typeChoices
                    },
                    {
                        name: 'reason',
                        description: '삭제할 템플릿의 사유를 입력합니다. // Enter the reason of the template you want to delete.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            }
        ]
    },
    handler: utils.subCommandHandler('reasontemplate'),
    autoCompleteHandler: utils.autoCompleteHandler('reasontemplate')
}