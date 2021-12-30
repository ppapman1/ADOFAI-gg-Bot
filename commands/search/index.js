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
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'query',
                        description: '검색할 레벨의 이름, 제작자, 작곡가 등을 입력하세요. // Enter the name, or creator, or artist.',
                        type: 'STRING',
                        autocomplete: true
                    },
                    {
                        name: 'mindifficulty',
                        description: '최소 레벨을 입력합니다. // Enter the minimum level.',
                        type: 'NUMBER',
                        min_value: 0,
                        max_value: 22
                    },
                    {
                        name: 'maxdifficulty',
                        description: '최대 레벨을 입력합니다. // Enter the maximum level.',
                        type: 'NUMBER',
                        min_value: 0,
                        max_value: 22
                    },
                    {
                        name: 'minbpm',
                        description: '최소 BPM을 입력합니다. // Enter the minimum BPM.',
                        type: 'NUMBER',
                        min_value: 0
                    },
                    {
                        name: 'maxbpm',
                        description: '최대 BPM을 입력합니다. // Enter the maximum BPM.',
                        type: 'NUMBER',
                        min_value: 0
                    },
                    {
                        name: 'mintiles',
                        description: '최소 타일 수를 입력합니다. // Enter the minimum number of tiles.',
                        type: 'INTEGER',
                        min_value: 0
                    },
                    {
                        name: 'maxtiles',
                        description: '최대 타일 수를 입력합니다. // Enter the maximum number of tiles.',
                        type: 'INTEGER',
                        min_value: 0
                    },
                    {
                        name: 'shownotverified',
                        description: '책정되지 않은 레벨(0레벨)을 포함해서 검색합니다. // Search including an undetermined level (level 0).',
                        type: 'BOOLEAN'
                    },
                    // {
                    //     name: 'showcensored',
                    //     description: '검열된 레벨(-2레벨)을 포함해서 검색합니다. // Search, including censored levels (-2).',
                    //     type: 'BOOLEAN'
                    // }
                ]
            },
            {
                name: 'artist',
                description: 'ADOFAI.gg에서 작곡가를 검색합니다. // Search for artists at ADOFAI.gg.',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: '검색할 작곡가의 이름을 입력하세요. // Enter the name of the artist.',
                        type: 'STRING',
                        required: true,
                        autocomplete: true
                    }
                ]
            }
        ]
    },
    handler: async interaction => {
        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/search/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/search/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] === '--debug') delete require.cache[file];
            const handler = require(file);
            if(handler.commandHandler) handler.commandHandler(interaction);
            else handler(interaction);
        }
        else interaction.reply({
            content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
            ephemeral: true
        });
    },
    autoCompleteHandler: async interaction => {
        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/search/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/search/${command}.js`)) {
            const file = require.resolve(`./${command}.js`);
            if(process.argv[2] === '--debug') delete require.cache[file];
            const handler = require(file);
            if(handler.autoCompleteHandler) handler.autoCompleteHandler(interaction);
        }
    }
}