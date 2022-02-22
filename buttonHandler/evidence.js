const { Embed } = require('discord.js');

const ADOFAIArtist = require('../schemas/ADOFAIArtist');

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length < 3) return;

    const artist = await ADOFAIArtist.findOne({
        id: params[1]
    });
    if(!artist) return;

    return interaction.reply({
        embeds: [
            new Embed()
                .setColor(0x349eeb)
                .setImage(artist.evidences[params[2]])
        ],
        ephemeral: true
    });
}