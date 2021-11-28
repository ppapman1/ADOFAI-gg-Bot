const lang = require('../../lang');
const utils = require('../../utils');
const adofaiAPI = require('../../adofaiapi');

const ADOFAIArtist = require('../../schemas/ADOFAIArtist');

module.exports.commandHandler = async interaction => {
    await interaction.deferReply();

    const artistName = interaction.options.getString('name');
    const artistRegex = new RegExp(utils.escapeRegExp(artistName), 'i');

    let offset = 0;

    const artists = await ADOFAIArtist.find({
        name: {
            $regex: artistRegex
        }
    }).limit(25);

    let count = await ADOFAIArtist.countDocuments({
        name: {
            $regex: artistRegex
        }
    });

    if(!count) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'SEARCH_NOT_FOUND'));

    if(count === 1) return interaction.editReply(adofaiAPI.getArtistInfoMessage(artists[0], interaction.dbUser.lang));

    const msg = await interaction.editReply(adofaiAPI.getSearchList(artists, 1, Math.ceil(count / 25), interaction.user.id, interaction.dbUser.lang));

    const collector = msg.createMessageComponentCollector({
        filter: i => [ 'prev' , 'next' ].includes(i.customId) && i.user.id === interaction.user.id,
        time: 30000
    });

    collector.on('collect', async i => {
        if(i.customId === 'prev') {
            offset -= 25;
            if(offset < 0) offset = 0;
        } else if(i.customId === 'next') {
            offset += 25;
            if(offset >= count) offset = count - 25;
        }

        const artists = await ADOFAIArtist.find({
            name: {
                $regex: artistName,
                $options: 'i'
            }
        }).skip(offset).limit(25);

        await interaction.editReply(adofaiAPI.getSearchList(artists, Math.ceil(offset / 25) + 1, Math.ceil(count / 25), interaction.user.id, interaction.dbUser.lang));
        await i.deferUpdate();

        return collector.resetTimer();
    });

    collector.on('end', async () => {
        const checkMsg = await msg.fetch();

        if(checkMsg.components[0].components[0].type !== 'SELECT_MENU') return;

        checkMsg.components[1].components[0].setDisabled();
        checkMsg.components[1].components[2].setDisabled();

        await interaction.editReply({
            components: checkMsg.components
        });
    });
}

module.exports.autoCompleteHandler = async interaction => {
    const artistName = interaction.options.getString('name');

    if(!artistName) return interaction.respond([]);

    const artistRegex = new RegExp(utils.escapeRegExp(artistName), 'i');
    const artists = await ADOFAIArtist.find({
        name: {
            $regex: artistRegex
        }
    }).limit(25);

    return interaction.respond(artists.map(a => ({
        name: a.name,
        value: a.name
    })));
}