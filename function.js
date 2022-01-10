import Discord from "discord.js";
import Settings from "./settings.js";

export default {
    /**
     * 
     * @param {Discord.Message} message 
     */
    SendSyntax: function(message, content) {
        message.reply(`Syntax: **${Settings.Discord.Prefix}${content}**`).then((msg) => {
            msg.delete({timeout: 5000});
        });
    },
    /**
     * 
     * @param {Discord.Message} message 
     * @param {Number} delete_after
     */
    SendMessage: function(message, content, delete_after=5) {
        message.channel.send(content).then((msg) => {
            msg.delete({timeout: delete_after*1000});
        }); 
    }
}