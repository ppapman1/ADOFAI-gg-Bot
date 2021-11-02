const main = require('../main');

const Eval = require('../schemas/eval');

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length !== 2) return;

    const eval = await Eval.findOne({ id : params[1] });
    if(!eval) return;

    const globalVars = main.getGlobalVariable();

    try {
        await eval(eval.code);
        if(interaction.replied) await interaction.deferUpdate();
    } catch (e) {
        return interaction.reply({
            content: 'error',
            ephemeral: true
        });
    }
}