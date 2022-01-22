const main = require('../main');

const Eval = require('../schemas/eval');

module.exports = async interaction => {
    const params = interaction.customId.split('_');
    if(params.length < 3) return;

    if(params[1].startsWith('run')) {
        const role = params[1].split(':')[1];
        console.log(role);
        if(role && !interaction.member.roles.cache.has(role) && !main.getOwnerID().includes(interaction.user.id)) return;

        const evalData = await Eval.findOne({ id : params[2] });
        if(!evalData) return interaction.reply({
            content: `eval data not found\nID : \`${params[2]}\``,
            ephemeral: true
        });

        const globalVars = main.getGlobalVariable();
        Object.getOwnPropertyNames(globalVars).forEach(n => global[n] = globalVars[n]);

        try {
            await eval(evalData.code);
            if(!interaction.replied) await interaction.deferUpdate();
        } catch (e) {
            console.error(e);
            return interaction.reply({
                content: 'error',
                ephemeral: true
            });
        }
    }

    if(params[1] === 'delete') {
        interaction.message.components[0].components[0].setDisabled();
        await interaction.update({
            components: interaction.message.components
        });

        return Eval.deleteOne({ id : params[2] });
    }
}