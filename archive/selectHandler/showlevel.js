const { MessageEmbed , MessageActionRow , MessageButton } = require('discord.js');

const setting = require('../setting.json');

const main = require('../main');
const utils = require('../utils');
const lang = require('../lang');
const api = require('../api');

const Server = require('../server.json');

module.exports = async interaction => {
    const params = interaction.values[0].split('_');
    if(params.length != 3) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'ERROR'),
        components: []
    });
    if(params[1] != interaction.user.id) return interaction.reply({
        content: lang.langByLangName(interaction.dbUser.lang, 'SELF_MESSAGE_ONLY'),
        ephemeral: true
    });

    const level = await api.getLevel(params[2]);
    if(!level) return interaction.update({
        content: lang.langByLangName(interaction.dbUser.lang, 'LEVEL_NOT_FOUND'),
        components: []
    });

    return interaction.update(api.getLevelInfoMessage(level, interaction.dbUser.lang));
}