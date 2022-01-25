const lang = require('../../lang');

const Todo = require('../../schemas/todo');

module.exports = async interaction => {
    await interaction.deferReply();

    const event = interaction.options.getString('target');
    const todo = interaction.options.getString('todo');

    let checkEvent;
    try {
        checkEvent = await interaction.guild.scheduledEvents.fetch(event);
    } catch(e) {
        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'EVENT_NOT_FOUND'));
    }

    await Todo.create({
        guild: interaction.guild.id,
        event,
        todo
    });

    return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TODO_CREATED')
        .replace('{event}', checkEvent.name)
        .replace('{todo}', todo)
    );
}