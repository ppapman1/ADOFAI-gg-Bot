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
                description: '정확도입니다. // This is accuracy. ',
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
        let accuracy = interaction.options.getNumber('accuracy');
        const maxAccuracy = (100+(level.tiles*0.01));
        const pitch = interaction.options.getNumber('pitch') || 100;
            
        //error
        if(!level) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'LEVEL_NOT_FOUND'));
        
        if(accuracy) if(accuracy < 0) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'ACCURACY_IS_TOO_LOW'));
            
        if(pitch < 0) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'PITCH_IS_TOO_LOW'));
        if(pitch > 100000) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'PITCH_IS_TOO_HIGH'));
        
        
        //emoji
        let difficultyString = level.difficulty.toString();
        if(level.censored) difficultyString = 'minus2';
    
        const levelEmoji = main.Server.emoji[difficultyString];
        if(!levelEmoji) return {
            content: lang.langByLangName(interaction.dbUser.lang, 'UNSUPPORTED_LEVEL'),
            ephemeral: true
        }
        
        
        //Calculate PP
        let ratingByDiff, accuracyV2, magByTiles, magByAcc, magByPitch;
        
        //Rating by Difficulty
        if(level.difficulty == -2) {
            ratingByDiff = 0.0;
        } else {
            ratingByDiff = 1600/(1+Math.exp(-0.42*((level.difficulty == -1) ? 20.5 : level.difficulty)+7.4));
        }
        
        //Magnification by Tiles
        if(level.tiles < 2000) {
            magByTiles = 0.84+level.tiles/12500;
        } else {
            magByTiles = (level.tiles/2000)^0.1;
        }

        //Converted Accuracy
        if(!accuracy) {
            accuracyV2 = 0.93;
            accuracy = maxAccuracy*0.93;
        } else if(accuracy > maxAccuracy) {
            //최대 정확도를 넘으면 정확도를 내부에서 -1로 저장하여 사용함
            accuracyV2 = 1.0;
            accuracy = -1;
        } else {
            accuracyV2 = accuracy/maxAccuracy;
        }
        
        //Magnification by Accuracy
        magByAcc = 0.013/(-(accuracyV2)+1.0125)+0.2;
        
        //Magnification by Pitch
        if(pitch < 100) {
            magByPitch = Math.pow((pitch/100), 1.8);
        } else {
            magByPitch = Math.pow(((1+(pitch/100))/2),Math.min((0.1+(level.tiles)^0.5/(2000^0.5),1.1)));
        }
        
        //Final Rating
        const resultPP = Math.pow(ratingByDiff*magByAcc*magByPitch*magByTiles, 1.01);
        
        
        //return Embed
        const returnEmbed = new MessageEmbed()
            .setColor('#349eeb')
            .setTitle(`${level.artists.join(' & ')} - ${level.title}`)
            .setURL(`${setting.MAIN_SITE}/levels/${level.id}`)
            .setDescription(lang.langByLangName(interaction.dbUser.lang, 'EXPECTED_PP').replace('{pp}', resultPP.toFixed(2)) + "\n\u200B")
            .addField('Lv.', levelEmoji.toString(), true)
            .addField('Speed', "`×" + (pitch/100).toFixed(2) + "`", true)
            .addField('Accuracy', "`" + ((accuracy == -1) ? maxAccuracy : accuracy).toFixed(2) + "%`", true)
            //.setImage(`https://i.ytimg.com/vi/${utils.parseYouTubeLink(level.video).videoCode}/original.jpg`)
            .setFooter(`ID : ${level.id}`);
        
        if(accuracy == -1) {
            return interaction.editReply({
                embeds: [returnEmbed],
                content: lang.langByLangName(interaction.dbUser.lang, 'ACCURACY_CANNOT_EXCEED').replace("{accuracy}", maxAccuracy.toFixed(2))
            });
        } else {
            return interaction.editReply({embeds: [returnEmbed]});
        }
    }
}
