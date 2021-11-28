const lang = require('../lang');
const adofaiAPI = require('../adofaiapi');

const ADOFAIArtist = require('../schemas/ADOFAIArtist');

module.exports = async interaction => {
    const params = interaction.values[0].split('_');
    if(params.length !== 3) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
        components: []
    });
    if(params[1] !== interaction.user.id) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'SELF_MESSAGE_ONLY'),
        ephemeral: true
    });

    const level = await ADOFAIArtist.findOne({
        id: params[2]
    });
    if(!level) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'ARTIST_NOT_FOUND'),
        components: []
    });

    return interaction.update(adofaiAPI.getArtistInfoMessage(level, interaction.dbUser.lang));
}