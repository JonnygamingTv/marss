if(interaction.guild){
let sq=interaction.options.get("title").value;
let stuff=sq.split('/w/');
if(!stuff[1])stuff=sq.split('#i');
if(!interaction.member.voice.channel||!interaction.member.voice.channel.joinable)return interaction.reply("Join a voicechannel that also I can join first!");
let aID=-1;
if(stuff[1]&&!isNaN(stuff[1])){
aID=stuff[1];fin();
}else{request('https://marss.one/s?q='+sq,function(e,r,b){try{let jso=JSON.parse(b);for(let i=0;i<jso.length;i++)if(jso[i][0]==0){aID=jso[i][1];return fin();}return interaction.reply({content:"Could not find anything. :(",ephemeral:true});}catch(e){return interaction.reply({content:"Could not find anything..",ephemeral:true});}});}
function fin(){
let ID=interaction.guild.id;
if(!que[ID])que[ID]=[[],[],null,null,null,null,false,0,[]]; // queID, queTitle, player, channel, connection, audioResource, playing, loop, skips
if(!que[ID][3]||que[ID][3].members.size<2)que[ID][3]=interaction.member.voice.channel;
play(interaction,0,ID,aID);
}
}
