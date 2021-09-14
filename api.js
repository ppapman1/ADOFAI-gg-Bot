const axios = require('axios');

const setting = require('./setting.json');

const api = axios.create({
    baseURL: setting.API
});

module.exports.searchLevel = async (query, minDifficulty, maxDifficulty, minBpm, maxBpm, minTiles, maxTiles) => {
    const search = await api.get('/levels', {
        params: {
            offset: 0,
            amount: 25,
            sort: 'RECENT_DESC',
            queryTitle: query,
            queryArtist: query,
            queryCreator: query,
            minDifficulty,
            maxDifficulty,
            minBpm,
            maxBpm,
            minTiles,
            maxTiles
        }
    });

    return search.data.results;
}

module.exports.getLevel = async id => {
    const level = await api.get(`/levels/${id}`);

    return level.data;
}