if(message.channel.type == 0) {
let stuff = args.join(0).split('/w/');
if(!stuff[1])stuff=args.join(0).split('#i');
if(!message.member.voice.channel||!message.member.voice.channel.joinable)return message.reply("Join a voicechannel that also I can join first!");
let aID=-1;
if(stuff[1]&&!isNaN(stuff[1])){
aID=stuff[1];fin();
}else{request('https://marss.one/s?m=1&q='+args.join(' '),function(e,r,b){try{let jso=JSON.parse(b);for(let i=0;i<jso.length;i++)if(jso[i][0]==0){aID=jso[i][1];return fin();}return message.reply("Could not find anything. :(");}catch(e){return message.reply("Could not find anything..");}});}
function fin(){
let ID=message.guild.id;
if(!que[ID])que[ID]=[[],[],null,null,null,null,false,0,[]]; // queID, queTitle, player, channel, connection, audioResource, playing, loop, skips
if(!que[ID][3]||que[ID][3].members.size<2)que[ID][3]=message.member.voice.channel;
play(0,message,ID,aID);
}
}else message.reply("Oops! "+message.channel.type);
