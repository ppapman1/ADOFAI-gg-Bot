const lang = require('../../lang');
const api = require('../../api');
const utils = require('../../utils');

module.exports.commandHandler = async interaction => {
    await interaction.deferReply();

    const { options } = interaction;

    const searchQuery = {
        query: options.getString('query'),
        sort: 'RECENT_DESC',
        minDifficulty: options.getNumber('mindifficulty'),
        maxDifficulty: options.getNumber('maxdifficulty'),
        minBpm: options.getNumber('minbpm'),
        maxBpm: options.getNumber('maxbpm'),
        minTiles: options.getInteger('mintiles'),
        maxTiles: options.getInteger('maxtiles'),
        showNotVerified: options.getBoolean('shownotverified'),
        // showCensored: options.getBoolean('showcensored')
    }

    let offset = 0;
    let count = 0;

    const searchResult = await api.searchLevel(searchQuery, true);
    const search = searchResult.results;
    count = searchResult.count;

    if(!search.length) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'SEARCH_NOT_FOUND'));

    if(search.length === 1) return interaction.editReply(api.getLevelInfoMessage(search[0], interaction.dbUser.lang, false, interaction.dbGuild.features?.includes('music')));

    const msg = await interaction.editReply(api.getSearchList(search, 1, Math.ceil(count / 25), interaction.user.id, interaction.dbUser.lang, searchQuery.includeTags?.split(',') || [], searchQuery.sort));

    const collector = msg.createMessageComponentCollector({
        filter: i => [ 'sort' , 'tagSearch' , 'removeTags' , 'prev' , 'next' ].includes(i.customId) && i.user.id === interaction.user.id,
        time: 30000
    });
    
    collector.on('collect', async i => {
        if(i.customId === 'sort') {
            offset = 0;

            searchQuery.offset = offset;
            searchQuery.sort = i.values[0];
        }
        if([ 'tagSearch' , 'removeTags' ].includes(i.customId)) {
            offset = 0;

            searchQuery.offset = offset;
            searchQuery.includeTags = i.customId === 'tagSearch' ? i.values.join(',') : null;
        }
        if([ 'sort' , 'tagSearch' , 'removeTags' ].includes(i.customId)) {
            const searchResult = await api.searchLevel(searchQuery, true);
            const search = searchResult.results;
            count = searchResult.count;

            const result = api.getSearchList(search, 1, Math.ceil(count / 25), interaction.user.id, interaction.dbUser.lang, i.values, searchQuery.sort);
            if(result.components[2].components[0].options[0].value === 'fake') {
                result.components[1].components[0].setDisabled();
                result.components[2].components[0].setDisabled();
                result.components[2].components[0].setPlaceholder(lang.langByLangName(interaction.dbUser.lang, 'CANT_FIND_LEVEL'));
            }
            await interaction.editReply(result);
        }
        if([ 'prev' , 'next' ].includes(i.customId)) {
            if(i.customId === 'prev') {
                offset -= 25;
                if(offset < 0) offset = 0;
            }
            else if(i.customId === 'next') {
                offset += 25;
                if(offset >= count) offset = count - 25;
            }

            searchQuery.offset = offset;
            const search = await api.searchLevel(searchQuery);

            const result = api.getSearchList(search, Math.ceil(offset / 25) + 1, Math.ceil(count / 25), interaction.user.id, interaction.dbUser.lang, searchQuery.includeTags?.split(',') || [], searchQuery.sort);
            await interaction.editReply(result);
        }

        await i.deferUpdate();
        return collector.resetTimer();
    });

    collector.on('end', async () => {
        const checkMsg = await msg.fetch();

        if(checkMsg.components.length !== 4) return;

        checkMsg.components[0].components[0].setDisabled();
        checkMsg.components[1].components[0].setDisabled();
        checkMsg.components[3].components[0].setDisabled();
        checkMsg.components[3].components[2].setDisabled();
        checkMsg.components[3].components[3].setDisabled();
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
        maxTiles: options.getNumber('maxtiles'),
        showNotVerified: options.getBoolean('shownotverified'),
        // showCensored: options.getBoolean('showcensored')
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

    return interaction.respond(complete.slice(0, 25).map(a => ({
        name: a,
        value: a
    })));
}