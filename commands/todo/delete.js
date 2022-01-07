const lang = require('../../lang');

const Todo = require('../../schemas/todo');

module.exports = async interaction => {
    await interaction.deferReply();

    const event = interaction.options.getString('target');
    const num = interaction.options.getInteger('num');

    let checkEvent;
    try {
        checkEvent = await interaction.guild.scheduledEvents.fetch(event);
    } catch(e) {
        return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'EVENT_NOT_FOUND'));
    }

    const checkTodo = await Todo.findOne({
        guild: interaction.guild.id,
        event
    }).skip(num - 1);
    if(!checkTodo) return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TODO_NOT_FOUND'));

    await Todo.deleteOne({
        id: checkTodo.id
    });

    return interaction.editReply(lang.langByLangName(interaction.dbUser.lang, 'TODO_DELETED')
        .replace('{event}', checkEvent.name)
        .replace('{todo}', checkTodo.todo)
    );
}