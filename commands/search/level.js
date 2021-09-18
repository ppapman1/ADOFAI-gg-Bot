const { MessageActionRow, MessageSelectMenu } = require('discord.js');

const lang = require('../../lang');
const api = require('../../api');

const Server = require('../../server.json');

module.exports = async interaction => {
    await interaction.deferReply();

    const { options } = interaction;

    const search = await api.searchLevel(
        options.getString('query'),
        options.getNumber('mindifficulty'),
        options.getNumber('maxdifficulty'),
        options.getNumber('minbpm'),
        options.getNumber('maxbpm'),
        options.getNumber('mintiles'),
        options.getNumber('maxtiles')
    );

    if(!search.length) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'SEARCH_NOT_FOUND'));

    const selectOptions = [];
    for(let l of search) {
        const title = `${l.artists.join(' & ')} - ${l.title}`;

        selectOptions.push({
            label: title.substring(0, 100),
            description: `by ${l.creators.join(' & ')}`,
            value: `showlevel_${interaction.user.id}_${l.id}`,
            emoji: {
                id: Server.emoji[l.difficulty.toString()]
            }
        });
    }

    return interaction.editReply({
        content: lang.langByLangName(interaction.dbUser.lang, 'SELECT_LEVEL_MESSAGE'),
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`showlevel`)
                        .setPlaceholder(lang.langByLangName(interaction.dbUser.lang, 'SELECT_LEVEL_SELECT_MENU'))
                        .addOptions(selectOptions)
                )
        ]
    });
}