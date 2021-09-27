import { CommandInteraction, MessageEmbed , MessageActionRow , MessageButton, ApplicationFlags } from "discord.js";

export class Command {
    /**
     ** 필요한 항목:
     * 명령어 id
     * 실행할 메서드
     * interaction?
     * 근데제가 클래스를 안써봤는데
     * ㅋㅋ 직접 하나하나 다 한거에요?;;
     * 아 만든적이 없어요
     * 대충 class 쓰는법 문서는 봤었는데 쓸일이없어서 
     * ?
     */
    constructor(public id: string, public actions: Map<string, CommandMethod>) {}


}

/**
 ** 번역 키 구조:
 * command.{id}.description
 * command.{id}.syntax
 * command.{id}.syntax.parameterName
 * command.{id}.error.errorName
 * 
 * {id} 또는 {id}.{subcommand}?
 * 
 * commandCommon.error.unknown
 * 
 ** ㅁㄴㅇㄴㅁㅁㅇㅁㄴㅇ 낼해야지
 * 
 */