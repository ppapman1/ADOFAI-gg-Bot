const { MessageEmbed } = require('discord.js');
const api = require('../api');
const lang = require("../lang");
const { getCommandDescription } = require('../lang');
const main = require('../main');

module.exports = {
    info: {
        name: 'calculatepp',
        description: getCommandDescription('CALCULATEPP_DESCRIPTION'),
        options: [
            {
                name: 'id',
                description: getCommandDescription('CALCULATEPP_ID_DESCRIPTION'),
                type: 'INTEGER',
                required: true,
                min_value: 1
            },
            {
                name: 'accuracy',
                description: getCommandDescription('CALCULATEPP_ACCURACY_DESCRIPTION'),
                type: 'NUMBER',
                min_value: 1
            },
            {
                name: 'pitch',
                description: getCommandDescription('CALCULATEPP_PITCH_DESCRIPTION'),
                type: 'NUMBER',
                min_value: 1
            }
        ]
    },
    handler: async interaction => {
        await interaction.deferReply();

        const levelID = interaction.options.getInteger('id');
        const level = await api.getLevel(levelID);
        let accuracy = interaction.options.getNumber('accuracy');
        const maxAccuracy = (100+(level.tiles*0.01));
        const pitch = interaction.options.getNumber('pitch') || 100;

        // error
        if(!level) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'LEVEL_NOT_FOUND'));
        if(level.error) return interaction.editReply(level.discordMessage);
        
        if(accuracy) if(accuracy < 0) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'ACCURACY_IS_TOO_LOW'));
            
        if(pitch < 0) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'PITCH_IS_TOO_LOW'));
        if(pitch > 100000) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'PITCH_IS_TOO_HIGH'));


        // emoji
        let difficultyString = level.difficulty.toString();
        if(level.censored) difficultyString = 'minus2';

        const levelEmoji = main.Server.emoji[difficultyString] || difficultyString;
        // if(!levelEmoji) return interaction.editReply({
        //     content: lang.langByLangName(interaction.dbUser.lang, 'UNSUPPORTED_LEVEL'),
        //     ephemeral: true
        // });


        // Calculate PP
        let accuracyV2, magByAcc, magByPitch;

        // Rating by Difficulty
        const ratingByDiff = level.difficulty === -2 ? 0.0 : (1600/(1+Math.exp(-0.42*((level.difficulty === -1) ? 20.5 : level.difficulty)+7.4)));

        // Magnification by Tiles
        const magByTiles = level.tiles < 2000 ? 0.84+level.tiles/12500 : Math.pow((level.tiles/2000),0.1);

        // Converted Accuracy
        if(!accuracy) {
            accuracyV2 = 0.93;
            accuracy = maxAccuracy*0.93;
        } else if(accuracy > maxAccuracy) {
            // 최대 정확도를 넘으면 정확도를 내부에서 -1로 저장하여 사용함
            accuracyV2 = 1.0;
            accuracy = -1;
        } else accuracyV2 = accuracy/maxAccuracy;

        // Magnification by Accuracy
        magByAcc = 0.013/(-(accuracyV2)+1.0125)+0.2;

        // Magnification by Pitch
        if(pitch < 100) {
            magByPitch = Math.pow((pitch/100), 1.8);
        } else {
            magByPitch = Math.pow(
                (1+(pitch/100))/2,
                Math.min(
                    Math.pow(0.1+(level.tiles),0.5)/Math.pow(2000,0.5),
                    1.1
                )
            );
        }

        // Final Rating
        const resultPP = Math.pow(ratingByDiff*magByAcc*magByPitch*magByTiles, 1.01);

        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('#349eeb')
                    .setTitle(`${level.artists.join(' & ')} - ${level.title}`)
                    .setURL(`${setting.MAIN_SITE}/levels/${level.id}`)
                    .setDescription(lang.langByLangName(interaction.dbUser.lang, 'EXPECTED_PP').replace('{pp}', resultPP.toFixed(2)) + "\n\u200B")
                    .addField('Lv.', levelEmoji.toString(), true)
                    .addField('Speed', "`×" + (pitch/100).toFixed(2) + "`", true)
                    .addField('Accuracy', "`" + ((accuracy === -1) ? maxAccuracy : accuracy).toFixed(2) + "%`", true)
                    // .setImage(`https://i.ytimg.com/vi/${utils.parseYouTubeLink(level.video).videoCode}/original.jpg`)
                    .setFooter({
                        text: `ID : ${level.id}`
                    })
            ],
            content: accuracy === -1 ? lang.langByLangName(interaction.dbUser.lang, 'ACCURACY_CANNOT_EXCEED').replace("{accuracy}", maxAccuracy.toFixed(2)) : null
        });
    }
}
