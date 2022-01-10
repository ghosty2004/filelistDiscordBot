import Discord from "discord.js";
import fetch from "node-fetch";
import https from "https";
import fs from "fs";

/* Custom Modules */
import Function from "./function.js";
import Settings from "./settings.js";

const bot = new Discord.Client();

let search_values = [];

bot.on("ready", () => {
    console.log(`${bot.user.tag} is ready`);
});

bot.on("message", async (message) => {
    if(message.author.id == bot.user.id) return;
    if(message.channel.type == "dm") return;

    let find_search_values = search_values.find(f => f.user == message.author.id);
    let find_search_index = search_values.findIndex(f => f.user == message.author.id);
    if(find_search_values) {
        if(find_search_values.list.length >= 1) {
            if(message.deletable) message.delete();
            find_search_values.message.delete();
            let index = message.content;
            let value = find_search_values.list[index-1];
            if(value) {
                const name_with_extension = `${value.name}.torrent`;
                const file = fs.createWriteStream(name_with_extension);
                https.get(value.download_link, (res) => {
                    res.pipe(file);
                    file.on('finish',() => {
                        file.close();
                        let attachment = new Discord.MessageAttachment(name_with_extension);
                        message.author.send(`:file_folder: File Info: :file_folder:\nName: **${value.name}**\nUpload date: **${value.upload_date}**\nCategory: **${value.category}**\nSeeders: **${value.seeders}**\nLeechers: **${value.leechers}**\nFiles: **${value.files}**`, {files: [attachment]}).then(() => {
                            message.reply("Check your DM :white_check_mark: !").then((msg) => {
                                msg.delete({timeout: 5000});
                            });
                            fs.unlinkSync(name_with_extension);
                        });
                    });
                });
                search_values.splice(find_search_index, 1);        
            }
            else {
                message.reply("Invalid item number.").then((msg) => {
                    msg.delete({timeout: 5000});
                });
            }
        }
    }

    let args = message.content.substring().split(" ");
    if(args[0].startsWith(Settings.Discord.Prefix)) {
        let exists = true;
        let command = args[0].replace(Settings.Discord.Prefix, "");
        args.shift();
        switch(command) {
            case "search": {
                const search = args.splice(0).join(" ");
                if(search) {
                    let result = await fetch(`https://filelist.io/api.php?username=${Settings.Filelist.User}&passkey=${Settings.Filelist.PassKey}&action=search-torrents&type=name&query=${search}`);
                    let data = await result.json();

                    const embed = new Discord.MessageEmbed();
                    embed.setColor(Settings.Discord.EmbedColor);
                    embed.setTitle(`Searching for ${search}`);
                    embed.setThumbnail("https://filelist.io/styles/images/logo.png");
                    embed.description = "";

                    search_values.push({
                        user: message.author.id,
                        message: null,
                        list: [],
                    });

                    let result_search_values = search_values.find(f => f.user == message.author.id);

                    let count = 0; 

                    data = data.slice(0, 30);

                    if(data.length == 0) return message.channel.send("No available results !", { code: true });

                    data.forEach((i) => {
                        count++;
                        result_search_values.list.push(i);
                        embed.description += `\n${count}. **${i.name}** (${i.category})`;
                    });

                    embed.setFooter("Type your item number what you want to download.");

                    message.channel.send(embed).then((msg) => {
                        result_search_values.message = msg;
                        setTimeout(() => {
                            if(!msg.deleted) msg.delete();
                            let index = search_values.findIndex(f => f.user == message.author.id);
                            if(index != -1) search_values.splice(index, 1);
                        }, 15000);
                    });
                }
                else Function.SendSyntax(message, "search <query>");
                break;
            }
            default: {
                exists = false;
                break;
            }
        }
        if(exists) {
            if(message.deletable) message.delete();
        }
    }
});

bot.login(Settings.Discord.Token);