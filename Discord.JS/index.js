console.log("Starting..",Date());
process.on("uncaughtException",function(err){console.error('['+new Date()+'] uncaughtException: '+err.message);console.error(err.stack);let contento="[ERROR] "+err.message;console.log(contento);});
process.on('unhandledRejection',(reason,promise)=>{console.log('Unhandled Rejection at:',reason.stack||reason);let contento=reason.stack||reason;console.log("[WARNING] "+contento);});
process.on('warning',(warn)=>{let contento="[WARNING] "+warn;console.log(contento);});

const fs=require('fs');
const net=require('net');
const request=require('request');

const config = require("./config.json");
if(!config.token) return console.log("No token provided. Go to https://discordapp.com/developers");
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const {REST, Routes}=require('discord.js');
const rest=new REST({version:'10'}).setToken(config.token);
const kommandon = [{name:'ping',description:'Replies with Pong!'},{name:'play',description:'Play something.',options:[{name:"title",description:"Search by title or use a link",type:3,required:true}]},{name:'queue',description:'Song queue'},{name:'loop',description:'Loop current song or queue',options:[{name:'which',description:'song or queue',type:3,required:false}]},{name:'skip',description:'Skip current song'},{name:'playing',description:'Currently playing'},{name:'stop',description:'Stop playing'},{name:'disconnect',description:'Stop playing'},{name:'help',description:'Get some help'},{name:'vote',description:'Vote and support me'}];

console.log(kommandon);
(async()=>{
  try{
    console.log('Updating application (/) commands.');
    await rest.put(Routes.applicationCommands(config.ID),{body:kommandon});
    console.log('Successfully reloaded application (/) commands.');
  }catch(error){
    console.error(error);
  }
})();

const client = new Discord.Client({intents:[Discord.GatewayIntentBits.Guilds,Discord.GatewayIntentBits.GuildMessages,Discord.GatewayIntentBits.DirectMessages,Discord.GatewayIntentBits.MessageContent,Discord.GatewayIntentBits.GuildVoiceStates]});

// when it is ready
client.on('ready', () => {
	console.log("Logged in as "+client.user.tag+" with the ID "+client.user.id);
client.user.setPresence({activities:[{name:client.guilds.cache.size+' marss.one',type:1,url:"https://twitch.tv/realjonnygamingtv"}],status:'online' });
});
setInterval(function(){client.user.setPresence({activities:[{name:client.guilds.cache.size+' marss.one',type:1,url:"https://twitch.tv/realjonnygamingtv"}],status:'online'});},180000);
let commands={};
// listen to messages

let que={};

client.on("messageCreate",async message=>{
setTimeout(function(){delete message;},30000);
	if(message.author.bot) return; // if bot
	let prefix = config.prefix;
	if(message.content.indexOf(prefix) !== 0) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase().replace(/\./g,'');
	if(!commands[command]) {
		if(fs.existsSync(`cmds/${command}.js`)) {
			let rcommand=command;
			if((command[command]=fs.readFileSync(`cmds/${command}.js`,'utf8',(err)=>{console.log(err);})).startsWith('alias:')) {
				rcommand = command[command].slice(6);
				commands[command] = fs.readFileSync(`cmds/${rcommand}.js`,'utf8',(err)=>{console.log(err);});
			}
		}
	}
	let mem_mention=message.mentions.members.first();
	if(commands[command]) try {eval(`(async () => {${commands[command]}})()`);} catch(error) {if(error) console.log(error);}
});

let interactions={};
client.on('interactionCreate',async interaction=>{
  if(interaction.isButton()){
if(que[interaction.guild.id]){
que[interaction.guild.id][7]=parseInt(interaction.customId.slice(1));
interaction.update("Loop "+interaction.component.label);
}else interaction.update("Not playing.");
return;}
  if (!interaction.isChatInputCommand()) return console.log(interaction);
let command = interaction.commandName.replace(/\./g,'');
	if(!interactions[command]) {
		if(fs.existsSync(`interaction/${command}.js`)) {
			let rcommand=command;
			if((interactions[command]=fs.readFileSync(`interaction/${command}.js`,'utf8',(err)=>{console.log(err);})).startsWith('alias:')) {
				rcommand = interactions[command].slice(6);
				interactions[command] = fs.readFileSync(`interaction/${rcommand}.js`,'utf8',(err)=>{console.log(err);});
			}
		}
	}
if(interactions[command]) try {eval(`(async () => {${interactions[command]}})()`);} catch(error) {if(error) console.log(error);}
});
client.login(config.token);
async function play(inte,msg,ID,lis){
let reply=null;
if(inte){await inte.reply("Loading..");reply=function(c){inte.editReply(c);};}else if(msg){let gg=await msg.reply("Loading..");reply=function(c){gg.edit(c);};}
if(!que[ID])que[ID]=[[],[],null,null,null,null,false,0,[]]; // queID, queTitle, player, channel, connection, audioResource, playing, loop, skips
if(typeof lis!='undefined'){que[ID][0].push(lis);let x=que[ID][1].length;que[ID][1][x]="music";request("https://marss.one/ga?i="+lis,function(e,r,b){try{let jso=JSON.parse(b);que[ID][1][x]=jso[5];
let embed = new Discord.EmbedBuilder()
.setAuthor({name:jso[0],iconURL:"https://marss.one/p?u="+jso[0]})
.setTitle(jso[5])
.setDescription(jso[6])
.setImage("https://marss.one/i?i="+lis)
.setTimestamp(jso[3])
.setFooter({text:jso[2].toString()})
.setColor(jso[8])
.setURL("https://marss.one/w/"+lis);
reply({embeds:[embed]});}catch(e){if(e)console.log(e,b);}});}
if(!que[ID][4])try{que[ID][4]=DiscordVoice.joinVoiceChannel({channelId:que[ID][3].id,guildId:ID,selfMute:false,debug:true,adapterCreator:que[ID][3].guild.voiceAdapterCreator});
}catch(e){if(reply)reply("Failed to join.");return console.log(e);}
if(que[ID][4]){
if(!que[ID][2]){que[ID][2]=DiscordVoice.createAudioPlayer();que[ID][2].on('error',console.error);que[ID][2].on(DiscordVoice.AudioPlayerStatus.Idle,function(){que[ID][6]=false;if(que[ID][7]!=2){if(que[ID][7]==1){que[ID][0][que[ID][0].length]=que[ID][0][0];}que[ID][0].shift();que[ID][1].shift();}que[ID][8]=[];if(que[ID][0].length){play(null,null,ID);}else{que[ID][4].disconnect();que[ID][4].destroy();que[ID]=[];delete que[ID];}});
que[ID][4].subscribe(que[ID][2]);}
if(!que[ID][6]||!que[ID][0]){
que[ID][5]=DiscordVoice.createAudioResource('https://marss.one/sa?i='+que[ID][0][0]);
que[ID][2].play(que[ID][5]);
que[ID][6]=true;
if(reply)await reply("Playing "+que[ID][1][0]);
}else{
if(reply)await reply("Added "+que[ID][1][que[ID][1].length-1]+" to queue.");
}
}
}
