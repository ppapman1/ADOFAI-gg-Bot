const lang = require('../../lang');
const api = require('../../api');
const utils = require('../../utils');

module.exports.commandHandler = async interaction => {
    await interaction.deferReply();

    const { options } = interaction;

    const searchQuery = {
        query: options.getString('query'),
        minDifficulty: options.getNumber('mindifficulty'),
        maxDifficulty: options.getNumber('maxdifficulty'),
        minBpm: options.getNumber('minbpm'),
        maxBpm: options.getNumber('maxbpm'),
        minTiles: options.getNumber('mintiles'),
        maxTiles: options.getNumber('maxtiles')
    }
    const search = await api.searchLevel(searchQuery);

    if(!search.length) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'SEARCH_NOT_FOUND'));

    if(search.length == 1) return interaction.editReply(api.getLevelInfoMessage(search[0], interaction.dbUser.lang));

    const msg = await interaction.editReply(api.getSearchList(search, interaction.user.id, interaction.dbUser.lang));

    const tagCollector = msg.createMessageComponentCollector({
        filter: i => i.customId == 'tagSearch' && i.user.id == interaction.user.id,
        time: 30000
    });
    
    tagCollector.on('collect', async i => {
        searchQuery.includeTags = i.values.join(',');
        const search = await api.searchLevel(searchQuery);

        const result = api.getSearchList(search, interaction.user.id, interaction.dbUser.lang, i.values);
        if(result.components[0].components[0].options[0].value == 'fake') {
            result.components[0].components[0].setDisabled();
            result.components[0].components[0].setPlaceholder(lang.langByLangName(interaction.dbUser.lang, 'CANT_FIND_LEVEL'));
        }
        await interaction.editReply(result);

        await i.deferUpdate();
        return tagCollector.resetTimer();
    });

    tagCollector.on('end', async () => {
        const checkMsg = await msg.fetch();

        if(checkMsg.components.length != 2) return;

        checkMsg.components[1].components[0].setDisabled();
        await interaction.editReply({
            components: checkMsg.components
        });
    });
}

module.exports.autoCompleteHandler = async interaction => {
    const { options } = interaction;

    const query = options.getString('query');

    if(!query) return interaction.respond([]);

    const queryRegex = new RegExp(utils.escapeRegExp(query), 'i');
    const searchQuery = {
        query,
        minDifficulty: options.getNumber('mindifficulty'),
        maxDifficulty: options.getNumber('maxdifficulty'),
        minBpm: options.getNumber('minbpm'),
        maxBpm: options.getNumber('maxbpm'),
        minTiles: options.getNumber('mintiles'),
        maxTiles: options.getNumber('maxtiles')
    }
    const search = await api.searchLevel(searchQuery);

    if(!search.length) return interaction.respond([]);

    const complete = [];

    for(let level of search) {
        if(complete.length < 25 && !complete.includes(level.title) && queryRegex.test(level.title)) complete.push(level.title);
        for(let artist of level.artists) if(!complete.includes(artist) && queryRegex.test(artist)) complete.push(artist);
        for(let creator of level.creators) if(!complete.includes(creator) && queryRegex.test(creator)) complete.push(creator);

        if(complete.length >= 25) break;
    }

    return interaction.respond(complete.map(a => ({
        name: a,
        value: a
    })));
}