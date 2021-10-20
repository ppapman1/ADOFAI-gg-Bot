const fs = require('fs');

const lang = require('../../lang');

module.exports = {
    info: {
        name: 'search',
        description: '검색 관련 명령어들입니다. // These are search-related instructions.',
        options: [
            {
                name: 'level',
                description: 'ADOFAI.gg에서 레벨을 검색합니다. // Search for levels at ADOFAI.gg.',
                'type': 'SUB_COMMAND',
                options: [
                    {
                        name: 'query',
                        description: '검색할 레벨의 이름, 제작자, 작곡가 등을 입력하세요. // Enter the name, or creator, or artist.',
                        type: 'STRING'
                    },
                    {
                        name: 'mindifficulty',
                        description: '최소 레벨을 입력합니다. // Enter the minimum level.',
                        type: 'NUMBER'
                    },
                    {
                        name: 'maxdifficulty',
                        description: '최대 레벨을 입력합니다. // Enter the maximum level.',
                        type: 'NUMBER'
                    },
                    {
                        name: 'minbpm',
                        description: '최소 BPM을 입력합니다. // Enter the minimum BPM.',
                        type: 'NUMBER'
                    },
                    {
                        name: 'maxbpm',
                        description: '최대 BPM을 입력합니다. // Enter the maximum BPM.',
                        type: 'NUMBER'
                    },
                    {
                        name: 'mintiles',
                        description: '최소 타일 수를 입력합니다. // Enter the minimum number of tiles.',
                        type: 'NUMBER'
                    },
                    {
                        name: 'maxtiles',
                        description: '최대 타일 수를 입력합니다. // Enter the maximum number of tiles.',
                        type: 'NUMBER'
                    }
                ]
            }
        ]
    },
    handler: async interaction => {
        const command = interaction.options.getSubcommand();

        if(fs.existsSync(`./commands/search/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] == '--debug') delete require.cache[file];
            require(file)(interaction);
        }
        else interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
            ephemeral: true
        });
    }
}