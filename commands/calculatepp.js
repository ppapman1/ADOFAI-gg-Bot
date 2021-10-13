const { MessageEmbed } = require('discord.js');
const api = require('../api');
const lang = require("../lang");
const main = require('../main');

const utils = require('../utils');

module.exports = {
    info: {
        name: 'calculatepp',
        description: '예상 PP를 계산합니다. // Calculate the expected pp',
        options: [
            {
                name: 'id',
                description: '레벨 ID입니다. // This is the level ID.',
                type: 'NUMBER', 
                required: true
            },
            {
                name: 'accuracy',
                description: '정확도입니다. // This is accuracy.',
                type: 'NUMBER'
            },
            {
                name: 'pitch',
                description: '피치입니다. // This is pitch.',
                type: 'NUMBER'
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const levelID = interaction.options.getNumber('id');
        const level = await api.getLevel(levelID);
        const accuracy = interaction.options.getNumber('accuracy');
        const pitch = interaction.options.getNumber('pitch') || 100;
        
        if(!level) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'LEVEL_NOT_FOUND'));
        
        
        const title = `${level.artists.join(' & ')} - ${level.title}`;

        let difficultyString = level.difficulty.toString();
        if(level.censored) difficultyString = 'minus2';

        const levelEmoji = main.Server.emoji[difficultyString];
        if(!levelEmoji) return {
            content: lang.langByLangName(interaction.dbUser.lang, 'UNSUPPORTED_LEVEL'),
            ephemeral: true
        }
        
        
        //calculate pp
        let diffV2 = (level.difficulty == -1) ? 20.5 : level.difficulty;
        let ratingByDiff = (diffV2 == -2) ? 0.0 : (1600/(1+Math.exp(-0.42*level.difficulty+7.4)));
        
        let magByTiles = (level.tiles < 2000) ? magByTiles = 0.84+level.tiles/12500 : (level.tiles/2000)^0.1;

        let accuracyV2 = accuracy ? accuracy/(100+(level.tiles*0.01)) : 0.93;
        let magByAcc = 0.013/(-(accuracyV2)+1.0125)+0.2;
        
        let magByPitch = (pitch < 100) ? Math.pow((pitch/100), 1.8) : Math.pow(((1+(pitch/100))/2),Math.min((0.1+(level.tiles)^0.5/(2000^0.5),1.1)));
        
        const resultPP = Math.pow(ratingByDiff*magByAcc*magByPitch*magByTiles, 1.01);
        
		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor('#349eeb')
					.setTitle(title)
					.setURL(`${setting.MAIN_SITE}/levels/${level.id}`)
					.setDescription(lang.langByLangName(interaction.dbUser.lang, 'EXPECTED_PP').replace('{pp}',Math.pow(ratingByDiff*magByAcc*magByPitch*magByTiles, 1.01).toFixed(4).toString()) + "\n\u200B")
					.addField('Lv.', levelEmoji.toString(), true)
					.addField('Speed', "x" + (pitch/100).toString(), true)
					.addField('Accuracy', ((accuracy) ? accuracy : ((100+(level.tiles*0.01))*0.93)).toString() + "%", true)
					//.setImage(`https://i.ytimg.com/vi/${utils.parseYouTubeLink(level.video).videoCode}/original.jpg`)
					.setFooter(`ID : ${level.id}`)
			]
        });
    }
}
