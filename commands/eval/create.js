const utils = require("../../utils");

const Eval = require('../../schemas/eval');

module.exports = async interaction => {
    const { options } = interaction;

    const name = options.getString('name');

    const checkName = await Eval.findOne({ name });
    if(checkName) return interaction.reply(`"${name}"${utils.checkBatchim(name) ? '이' : '가'} 이미 존재합니다.`);

    const msg = await interaction.reply({
        fetchReply: true,
        content: '여기에 js 코드를 담은 코드 블럭으로 답장하세요.'
    });

    let response = await interaction.channel.awaitMessages({
        filter: m => m.author.id === interaction.user.id && m.type === 'REPLY' && m.reference.messageId === msg.id,
        max: 1,
        time: 120000
    });
    if(!response.first()) return interaction.followUp('시간이 초과되었습니다.');
    response = response.first().content;

    const code = utils.parseDiscordCodeBlock(response);
    if(!code) return interaction.followUp('코드 블럭 메시지가 잘못되었습니다.');

    const eval = new Eval({
        name,
        code: code.code
    });
    await eval.save();

    return interaction.followUp(`eval "${name}"${utils.checkBatchim(name) ? '이' : '가'} 생성되었습니다.\nID : \`${eval.id}\``);
}