const Discord = require('discord.js');
var fs = require('fs');
var jsonfile = require('jsonfile');
var request = require('request');
var util = require('./bot_modules/utilities.js');
//var cmd = require('./bot_modules/commands.js');

//GLOBALS
const bot = new Discord.Client();
const token = 'MjI1MzQ1NjYxNTkwMDQ0Njcy.CrntFw.jHDKx9Mj2ExBa6twSz7lywTu2-o';
const twitchToken = 'a3igeitms47ixqrjr7yjs8c1tgz07kf';
const devId = "133352797776248832";
const prefix = '!';
const serversdb = './server_data/serversdb.json';
const currencydb = './server_data/currencydb.json';
const squadsdb = './server_data/squads.json';

var settings, currency, squads;

bot.on('ready', ()=>{
  console.log('Systems................[ONLINE]');
  try{
    settings = jsonfile.readFileSync(serversdb);
    console.log('Database...............[ONLINE]');
    currency = jsonfile.readFileSync(currencydb);
    console.log('Currency...............[ONLINE]');
    squads = jsonfile.readFileSync(squadsdb);
  }
  catch(err){
    console.log(err);
  }
});



bot.on('message', message=>{
    if(message.author.bot || message.channel.type === 'dm') return;
    if(message.content.toLowerCase() == 'hmm') message.channel.sendMessage(':thinking:');
    if(message.content[0] === prefix && message.content.length > 2){
      try{
        if(!checkCommand(message)) throw('Unrecognized command.  Type '+prefix+'help for a list of available commands.');
        return;
      }
      catch(err){
        console.log('FAILED! >> '+message.guild.member(message.author).displayName + ' :: ' +message.cleanContent);
        console.log('Why: '+err);
        message.channel.sendMessage(':boom: ' + message.author + ', **Command failed:** `'+message.cleanContent+'`\n **Why?:** `'+ err+'`');
      }
    }
    //if(settings.hasOwnProperty(message.guild.id) && settings[message.guild.id].memes.hasOwnProperty(message.content.toLowerCase())) message.channel.sendMessage(settings[message.guild.id].memes[message.content.toLowerCase()].response);
});

bot.on('guildMemberAdd', (member)=>{
  try{
    let guild = member.guild;
    if(settings[guild.id].greetmsg.status && guild.channels.exists('name', settings[guild.id].greetmsg.channel)) guild.channels.find('name', settings[guild.id].greetmsg.channel).sendMessage(settings[guild.id].greetmsg.msg.replace('@user', '<@'+member.id+'>'));
    if(settings[guild.id].greetpm.status) member.sendMessage(settings[guild.id].greetpm.msg.replace('@user', '<@'+member.id+'>'));
    if(settings[guild.id].logs.status && guild.channels.exists('name', settings[guild.id].logs.channel)) guild.channels.find('name', settings[guild.id].logs.channel).sendMessage(':white_check_mark: ' +member +' `'+ util.showName(member) +'` has joined the server.');
    if(settings[guild.id].defaultrole.status && guild.roles.exists('name', settings[guild.id].defaultrole.name)) member.addRole(guild.roles.find('name', settings[guild.id].defaultrole.name));
  }
  catch(err){
    console.log('Failed on guildMemberAdd');
    console.log(err);
  }
});

bot.on('guildMemberRemove', (member)=>{
  try{
    let guild = member.guild;
    if(settings[guild.id].leave.status) member.sendMessage(settings[guild.id].leave.msg.replace('@user', '<@'+member.id+'>'));
    if(settings[guild.id].logs.status && guild.channels.exists('name', settings[guild.id].logs.channel)) guild.channels.find('name', settings[guild.id].logs.channel).sendMessage(':x: ' + member +' `'+util.showName(member) + '` has left the server.');
  }
  catch(err){
    console.log('Failed on guildMemberRemove');
    console.log(err);
  }
});

bot.on('guildMemberUpdate', (oldMember, newMember)=>{
  try{
    let logChannel = settings[newMember.guild.id].logs.channel;
    if(settings[newMember.guild.id].logs.status && newMember.guild.channels.exists('name', logChannel)){
        if( newMember.displayName !== oldMember.displayName)
          newMember.guild.channels.find('name', logChannel).sendMessage(':arrows_clockwise: `' + util.showName(oldMember) +'` nickname is now: `' + util.showName(newMember)+'`');
        /*if( newMember.roles.size > oldMember.roles.size){
          //new roles Added
          let roles = newMember.roles.filter(function(current){
            if(!oldMember.roles.exists('name', current.name)) return current;
          });
          newMember.guild.channels.find('name', logChannel).sendMessage(':heavy_plus_sign: `' + util.showName(newMember) + '` gained role: `' + roles.first().name +'`');
        }
        if (newMember.roles.size < oldMember.roles.size){
          let roles = oldMember.roles.filter(function(current){
            if(!newMember.roles.exists('name', current.name)) return current;
          });
          newMember.guild.channels.find('name', logChannel).sendMessage(':heavy_minus_sign: `' + util.showName(newMember) + '` lost role: `' + roles.first().name + '`');
        }*/
    }
  }
  catch(err){
    console.log('guildMemberUpdate failed.');
    console.log(err);
  }
});
bot.login(token);

function checkCommand(msg){
  let arr = msg.content.split(' ');
  let str = arr[0].slice(1);
  if(cmd.hasOwnProperty(str.toLowerCase())) {
    cmd[str.toLowerCase()].process(msg, util.parseParams(msg.content));
    return true;
  }
  else return false;
}

var cmd = {
  "help":{
      name: 'help',
      permission: ['@everyone'],
      usage: "`"+prefix+"help <command>`",
      description: "Shows usage information for the specified command.",
      parameters: "`<command>` - (Optional) An existing command to see help info for.",
      process: function(msg, params){
        if(params.length === 0){
          let str = "";
          for(k in keys = Object.keys(cmd)){
            let permsarr = cmd[keys[k]].permission;
            for(key in permsarr){
              if(permsarr[key] === '@everyone' || (permsarr[key][0] === '@' && msg.guild.member(msg.author).roles.exists('name', permsarr[key].substring(1))) || (msg.guild.member(msg.author).hasPermission(permsarr[key]))){
                str += '**'+cmd[keys[k]].name + '** -- *`'+cmd[keys[k]].description+'`*\n\n';
                break;
              }
            }
          }
          msg.channel.sendMessage(msg.author+', a list of commands have been slid into your DMs. :wink: ');
          msg.author.sendMessage(msg.author+', here are a list of commands available to your permissions level:\n \n'+str+'\nType `'+prefix+'help <command>` to see detailed usage info. \n:exclamation: **Please be aware that parameters with more than 1 word must be wrapped in quotation marks.**');
        }
        else{
          if(cmd.hasOwnProperty(params[0])){
            msg.channel.sendMessage('**Usage:** '+cmd[params[0]].usage+ '\n**Description:** `' + cmd[params[0]].description + '`\n**Parameters:**\n '+cmd[params[0]].parameters+' \n**Permissions:** *`'+cmd[params[0]].permission+'`*');
          }
          else throw('"'+params[0]+'" is not a recognized command. Type '+prefix+'help" for a list of commands.');
        }
      }
  },
  "ping":{
      name: 'ping',
      permission: ['@everyone'],
      usage: "`"+prefix+"ping`",
      description: "Responds with pong to see if the bot is alive.",
      parameters: 'none',
      process: function(msg, params){
        msg.channel.sendMessage('pong!');
      }
  }, //end ping
  "info":{
    name: 'info',
    permission: ['@everyone'],
    usage: "`"+prefix+"info <@user>`",
    description: "Displays information for the tagged user.",
    parameters: '`<@user>` - (Required) The specified tagged user.',
    process: function(msg, params){
      if(params.length !== 1) throw('Incorrect parameters. Type "'+prefix+'help info" for usage information.');
      if(msg.mentions.users.size > 1) throw ('Must tag only one user for information look-up.');
      if(msg.mentions.users.size === 0){
          if(msg.guild.members.exists('displayName', params[0])) var user = msg.guild.members.find('displayName', params[0]).user;
          else throw('Unable to find the user "'+params[0]+'". \n(Keep in mind this command is case-sensitive)');
      }
      else{
        var user = msg.mentions.users.first();
      }
      let guildUser = msg.guild.member(user);
      let roles = guildUser.roles.array();
  		for(key in roles){
  			roles[key] = ''+roles[key].name;
  		}
      let gamename = user.presence.game;
      if(gamename === null) gamename = 'n/a';
      else gamename = gamename.name;
      let ava = user.avatarURL;
      if(ava === null) ava = 'n/a';
      msg.channel.sendMessage(
        'Showing information for user: **`'+ util.showName(guildUser) + '`**'
        +'\n **User ID:** ' + user.id
        +'\n **Status:** ' + user.presence.status
        +'\n **Playing:** ' + gamename
        +'\n **Roles:** `' + roles.join(', ') + '`'
        +'\n **Server joined on:** '+ guildUser.joinedAt
        +'\n **Account created:** ' + user.createdAt
        +'\n **Avatar:** '+ ava);
    }
  },
  "poll":{
    name: 'poll',
    permission: ['@everyone'],
    usage: '`'+prefix+'poll "<title>" <option1> <option2> [option3] ...`',
    description: 'Creates a strawpoll with the given options and title.',
    parameters: '`"<title>"` - (Required) The title of the poll'
              +'\n`<option1>` - (Required) First option of the poll'
              +'\n`<option2>` - (Required) Second option of the poll'
              +'\n`[optionX]` - (Optional) Keep adding more options...',
    process: function(msg, params){
        if(params.length === 0) { cmd.help.process(msg, ['poll']); return;}
        if(params.length < 3) throw('Not enough parameters. Polls must have at least two options to start. Type "'+prefix+'help poll" for usage information.');
        var options = {
  				method: 'post',
  				body: {
  					'title': params[0],
  					'options': params.slice(1),
  					'multi':false,
            'dupcheck': 'normal'
  				},
  				json: true,
  				url: 'https://strawpoll.me/api/v2/polls'
  			};
        request(options, function(error, response, body){
  				msg.channel.sendMessage(':1234: '+msg.author+ ' started a **POLL**:\n `'+params[0]+'`: http://www.strawpoll.me/'+body.id);
  			});
    }
  },
  "8ball":{
    name: '8ball',
    permission: ['@everyone'],
    usage: '`'+prefix+'8ball <question>`',
    description: 'See what the magic 8ball has to say...',
    parameters: '`<question>` - (Required) The question to ask',
    process: function(msg, params){
      if(params.length === 0){ cmd.help.process(msg, ['8ball']); return;}
      //var myArray2 = ['Fuck Laine', 'FUcK Zalera', 'Fuck everyone leave me the fuck alone bitch', 'fuck you too', 'fuck tracie', 'alk is gay', 'i dont want to live on this planet anymore', 'fuck jews', 'fuck gays', 'hentai'];
      var myArray = ['Maybe.', 'Certainly not.', 'I hope so.', 'Not in your wildest dreams.',
                    'There is a good chance.', 'Quite likely.', 'I think so.', 'I hope not.',
                    'I hope so.', 'Never!', 'Fuhgeddaboudit.', 'Ahaha! Really?!?', 'Pfft.',
                    'Sorry, bucko.', 'Hell, yes.', 'Hell to the no.', 'The future is bleak.',
                    'The future is uncertain.', 'I would rather not say.', 'Who cares?',
                    'Possibly.', 'Never, ever, ever.', 'There is a small chance.', 'Yes!'];
      msg.channel.sendMessage(':8ball: ' +msg.author+', `'+myArray[Math.floor(Math.random() * myArray.length)]+'`');
    }
  },
  "twitch":{
    name:'twitch',
    permission: ['@everyone'],
    usage: '`'+prefix+'twitch <streamer name>`',
    description: 'Checks if the streamer is online and streaming.',
    parameters: '`<streamer name>` - (Required) the name of the streamer to check',
    process: function(msg, params){
        if(params.length === 0 ){ cmd.help.process(msg, ['twitch']); return;}
        var options = {
  				method: 'get',
  				json: true,
  				url: 'https://api.twitch.tv/kraken/streams/'+params[0]+'?client_id='+twitchToken
  			};
        request(options, function(error, response, body){
  				if(body.stream === null){
            msg.channel.sendMessage(':black_circle:  <http://twitch.tv/'+params[0]+'> is currently **`OFFLINE`**');
          }
          else{
            msg.channel.sendMessage(':red_circle:  <http://twitch.tv/'+params[0]+'> is currently **`LIVE`**\n*`'+body.stream.channel.status+'`*\nPlaying: **`'+body.stream.game+'`** with *'+body.stream.viewers+' viewers*.');
          }

  			});
    }
  },
  "myclass":{
    name: 'myclass',
    permission: ['@Member'],
    usage: '`'+prefix+'myclass [gunslinger|occultist|swordmage|vanguard|spiritshaper|blademaster]`',
    description: 'Adds a class role to user',
    parameters: '`<class name>` - (Required) the name of the class you are in-game',
    process: function(msg, params){
      if(params.length === 0) {cmd.help.process(msg, ['myclass']); return; }
      if(params.length > 1) throw('Incorrect parameters');
      let classes = ['Gunslinger', 'Vanguard', 'Spiritshaper', 'Blademaster', 'Occultist', 'Swordmage'];

      if(classes.indexOf(params[0].charAt(0).toUpperCase() + params[0].slice(1).toLowerCase()) === -1) throw('Did not recognize the class: '+params[0]);
      for(key in classes){
        if(!msg.guild.roles.exists('name', classes[key])) throw('The role '+classes[key]+' does not exist on this server.');
        if(msg.member.roles.exists('name', classes[key])) msg.member.removeRole(msg.guild.roles.find('name', classes[key]));
      }
      msg.member.addRole(msg.guild.roles.find('name', params[0].charAt(0).toUpperCase()+params[0].slice(1).toLowerCase()));
      msg.channel.sendMessage(msg.author+', You are now `'+params[0].charAt(0).toUpperCase() + params[0].slice(1)+'` and should now have access to '+msg.guild.channels.find('name', params[0].toLowerCase()+'-chat'));
      if(settings[msg.guild.id].logs.status && msg.guild.channels.exists('name', settings[msg.guild.id].logs.channel)){
        msg.guild.channels.find('name', settings[msg.guild.id].logs.channel).sendMessage('**'+util.showName(msg.member)+'** `has been marked as a` **' + params[0].charAt(0).toUpperCase() + params[0].slice(1).toLowerCase()+'**');
      }
    }
  },
  "delete":{
    name: 'delete',
    permission: ['MANAGE_MESSAGES'],
    usage: '`'+prefix+'delete ...` *(See parameters)*',
    description: 'Deletes messages based on specified parameters',
    parameters:'`[number]` - (Optional) The number of previous messages to delete'
              +'\n`"[text]"` - (Optional) Messages containing specified text will be deleted'
              +'\n`[@user(s)]` - (Optional) Messages from the tagged user(s) will be deleted'
              +'\n:exclamation: Any combination of the above parameters are allowed',
    process: function(msg, params){
      if(!msg.guild.member(msg.author).hasPermission(this.permission)) throw('You do not have permissions to do this. Must have "'+this.permission+'" permissions.');
      if(params.length === 0) { cmd.help.process(msg, ['delete']); return; }

      //strips except for numbers
      //console.log(msg.guild.member(params[0].replace(/[^0-9.]/g,'')));
    }
  },
  "mute":{
    name: 'mute',
    permission: ['MANAGE_MESSAGES'],
    usage: '`'+prefix+'mute <@user>`',
    description: 'Mutes the tagged user in the current channel',
    parameters: '`<@user>` - (Required) The user to be muted',
    process: function(msg, params){
      if(!util.checkPerms(this.permission, msg)) throw('You do not have permissions to do this.');
      if(params.length === 0) {cmd.help.process(msg, ['mute']); return;}
      if(msg.mentions.users.size > 1 || msg.mentions.users.size === 0) throw('Must tag only one user to mute.');
      else{
        if(!msg.channel.permissionsFor(msg.mentions.users.first()).hasPermission('SEND_MESSAGES')) throw('The tagged user is already muted.');
        msg.channel.overwritePermissions(msg.mentions.users.first(), {SEND_MESSAGES: false});
        console.log('>> '+util.showName(msg.guild.member(msg.author))+' MUTED user '+util.showName(msg.guild.member(msg.mentions.users.first().id)));
        msg.channel.sendMessage(':mute:' + msg.author+' has muted '+msg.mentions.users.first() +' in this channel.');
        if(settings[msg.guild.id].logs.status && msg.guild.channels.exists('name', settings[msg.guild.id].logs.channel))
          msg.guild.channels.find('name', settings[msg.guild.id].logs.channel).sendMessage(':mute: `' + util.showName(msg.guild.member(msg.author)) + '` has muted the user: `' +util.showName(msg.guild.member(msg.mentions.users.first())) + '` in the channel: '+msg.channel);
      }
    }
  },
  "unmute":{
    name: 'unmute',
    permission: ['MANAGE_MESSAGES'],
    usage: '`'+prefix+'unmute <@user>`',
    description: 'Unmutes the tagged user in the current channel',
    parameters: '`<@user>` - (Required) The user to be unmuted',
    process: function(msg, params){
      if(!util.checkPerms(this.permission, msg)) throw('You do not have permissions to do this.');
      if(params.length === 0) { cmd.help.process(msg, ['unmute']); return;}
      if(msg.mentions.users.size === 0 || msg.mentions.users.size >1) throw('Must tag one user to unmute.');
      if(msg.channel.permissionsFor(msg.mentions.users.first()).hasPermission('SEND_MESSAGES')) throw('The tagged user is not muted.');
      else{
        msg.channel.overwritePermissions(msg.mentions.users.first(), {SEND_MESSAGES: true});
        console.log('>> '+util.showName(msg.guild.member(msg.author))+' UNMUTED user '+util.showName(msg.guild.member(msg.mentions.users.first().id)));
        msg.channel.sendMessage(':sound:' + msg.author+' has unmuted '+msg.mentions.users.first()+' in this channel.');
        if(settings[msg.guild.id].logs.status && msg.guild.channels.exists('name', settings[msg.guild.id].logs.channel))
          msg.guild.channels.find('name', settings[msg.guild.id].logs.channel).sendMessage(':sound: `' +util.showName(msg.guild.member(msg.author)) + '` has unmuted the user: `' + util.showName(msg.guild.member(msg.mentions.users.first())) + '` in the channel: '+msg.channel);
      }
    }
  },
  "announce":{
    name: 'announce',
    permission: ['ADMINISTRATOR'],
    usage: '`'+prefix+'announce [@user(s)|@role(s)] "text here"`',
    description: 'Announces to specified users or to everyone if none specified, via private message.',
    parameters: '`[@user(s)|@role(s)]` - (Optional) Specify some users or roles to announce to.'
              +'\n`"text here"` - (Required) The text you want to announce. **MUST be wrapped in quotes.**',
    process: function(msg, params){
      if(!util.checkPerms(this.permission, msg)) throw('You do not have permissions to do this.');
      if(params.length === 0){ cmd.help.process(msg, ['announce']); return}
      if(message.cleanContent.split().length  !== 3) throw('Incorrect parameters. Please make sure to wrap your text in quotation marks.');
      var mentionedUsers = null, mentionedRoles = null, announcement = msg.cleanContent.split()[1];
      if(msg.mentions.users.size > 0) mentionedUsers = msg.mentions.users.array();
      if(msg.mentions.roles.size > 0) mentionedRoles = msg.mentions.roles.array();

    }
  },
  "set":{
    name: 'set',
    permission: ['ADMINISTRATOR'],
    usage: '`'+prefix+'set <greetmsg|greetpm|leavemsg|logchannel|defaultrole> <value>`',
    description: 'Sets the desired configuration to what is included in text.',
    parameters: '`<greetmsg|greetpm|...>` - (Required) The desired tag to set'
              +'\n`<value>` - (Required) The message or channel name or role name to set.'
              +'\n    :exclamation: *@user* in messages will be replaced with the actual user tag when invoked'
              +'\n    :exclamation: *logchannel* must be the plain-text name of the channel'
              +'\n    :exclamation: *defaultrole* must be an existing role on the server',
    process: function(msg, params){
      if(!util.checkPerms(this.permission, msg)) throw('You do not have permissions to do this.');
      if(!settings.hasOwnProperty(msg.guild.id)) throw('Server settings have not yet been initialized for this server.');
      if(params.length === 0) { cmd.help.process(msg, ['set']); return; }
      if(params.length !== 2) throw('Incorrect number of parameters. Type "'+prefix+'help set" for usage information.');
      if(params[0] === 'greetmsg'){
        settings[msg.guild.id].greetmsg.msg = params[1];
        settings = util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author+', `'+params[0]+'` successfully set.');
      }
      else if(params[0] === 'greetmsgchannel'){
        if(!msg.guild.channels.exists('name', params[1])) throw('The channel "#'+params[1]+'" does not exist.');
        settings[msg.guild.id].greetmsg.channel = params[1];
        settings = util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author+', `'+params[0]+'` successfully set');
      }
      else if(params[0] === 'greetpm'){
        settings[msg.guild.id].greetpm.msg = params[1];
        settings = util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author+', `'+params[0]+'` successfully set.');
      }
      else if(params[0] === 'leavemsg'){
        settings[msg.guild.id].leave.msg = params[1];
        settings = util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author+', `'+params[0]+'` successfully set.');
      }
      else if(params[0] === 'logchannel'){
        if(!msg.guild.channels.exists('name', params[1])) throw('The channel "#'+params[1]+'" does not exist.');
        settings[msg.guild.id].logs.channel = params[1];
        settings = util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author+', `'+params[0]+'` successfully set.');
      }
      else if(params[0] === 'defaultrole'){
        if(!msg.guild.roles.exists('name', params[1])) throw('The role "'+params[1]+'" does not exist.');
        settings[msg.guild.id].defaultrole.name = params[1];
        settings = util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author+', `'+params[0]+'` successfully set.');
      }
      else throw('Unrecognized parameter "'+params[0]+'". Please specify either "greetmsg", "greetmsgchannel", "greetpm", "leavemsg", "logchannel", or "defaultrole". Type "'+prefix+'help set" for detailed usage information.');
    }
  },
  "toggle":{
    name: 'toggle',
    permission: ['ADMINISTRATOR'],
    usage: '`'+prefix+'toggle <greetmsg|greetpm|leavemsg|logchannel|defaultrole> ["on"|"off"]`',
    description: 'Toggles the desired setting on or off',
    parameters: '`<greetmsg|greetpm|...>` - (Required) The desired tag to toggle'
              +'\n`[on|off]` - (Optional) Can specify on or off. Otherwise, will toggle to opposite of current setting.',
    process: function(msg, params){
      if(!util.checkPerms(this.permission, msg)) throw('You do not have permissions to do this.');
      if(!settings.hasOwnProperty(msg.guild.id)) throw('Server settings have not yet been initialized for this server.');
      if(params.length === 0) {cmd.help.process(msg, ['toggle']); return;}
      if(params.length > 2) throw('Incorrect parameters. Type "'+prefix+'help toggle" for usage information.');
      if(params.length === 2 && !(params[1].toLowerCase() === 'on' || params[1].toLowerCase() === 'off')) throw('Incorrect second parameter. Must specify either "on" or "off". This parameter is optional.');
      if(params[0] === 'greetmsg'){
        if(params.length === 2 && params[1].toLowerCase() === 'on') settings[msg.guild.id].greetmsg.status = true;
        else if(params.length === 2 && params[1].toLowerCase() === 'off') settings[msg.guild.id].greetmsg.status = false;
        else settings[msg.guild.id].greetmsg.status = !settings[msg.guild.id].greetmsg.status;
        util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author +', `'+params[0]+'` is now set to **'+util.getStatus(settings[msg.guild.id].greetmsg.status)+'**.');
      }
      else if(params[0] === 'greetpm'){
        if(params.length === 2 && params[1].toLowerCase() === 'on') settings[msg.guild.id].greetpm.status = true;
        else if(params.length === 2 && params[1].toLowerCase() === 'off') settings[msg.guild.id].greetpm.status = false;
        else settings[msg.guild.id].greetpm.status = !settings[msg.guild.id].greetpm.status;
        util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author +', `'+params[0]+'` is now set to **'+util.getStatus(settings[msg.guild.id].greetpm.status)+'**.');
      }
      else if(params[0] === 'leavemsg'){
        if(params.length === 2 && params[1].toLowerCase() === 'on') settings[msg.guild.id].leave.status = true;
        else if(params.length === 2 && params[1].toLowerCase() === 'off') settings[msg.guild.id].leave.status = false;
        else settings[msg.guild.id].leave.status = !settings[msg.guild.id].leave.status;
        util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author +', `'+params[0]+'` is now set to **'+util.getStatus(settings[msg.guild.id].leave.status)+'**.');
      }
      else if(params[0].startsWith('log')){
        if(params.length === 2 && params[1].toLowerCase() === 'on') settings[msg.guild.id].logs.status = true;
        else if(params.length === 2 && params[1].toLowerCase() === 'off') settings[msg.guild.id].logs.status = false;
        else settings[msg.guild.id].logs.status = !settings[msg.guild.id].logs.status;
        util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author +', `logchannel` is now set to **'+util.getStatus(settings[msg.guild.id].logs.status)+'**.');
      }
      else if(params[0] === 'defaultrole'){
        if(params.length === 2 && params[1].toLowerCase() === 'on') settings[msg.guild.id].defaultrole.status = true;
        else if(params.length === 2 && params[1].toLowerCase() === 'off') settings[msg.guild.id].defaultrole.status = false;
        else settings[msg.guild.id].defaultrole.status = !settings[msg.guild.id].defaultrole.status;
        util.refresh(serversdb, settings);
        msg.channel.sendMessage(msg.author +', `'+params[0]+'` is now set to **'+util.getStatus(settings[msg.guild.id].defaultrole.status)+'**.');
      }
      else throw('Unrecognized parameter "'+params[0]+'". Please specify either "greetmsg, "greetpm", "leavemsg", "logchannel", or "defaultrole". Type "'+prefix+'help toggle" for detailed usage information.');
    }
  },
  "get":{
    name: "get",
    permission: ['ADMINISTRATOR'],
    usage: '`'+prefix+'get <greetmsg|greetpm|leavemsg|logchannel|defaultrole>`',
    description: 'Displays what the current specified tag is set to.',
    parameters: '`<greetmsg|greetpm|...>` - (Required) The desired tag to see details of',
    process: function(msg, params){
      if(!util.checkPerms(this.permission, msg)) throw('You do not have permissions to do this.');
      if(!settings.hasOwnProperty(msg.guild.id)) throw('Server settings have not yet been initialized for this server.');
      if(params.length === 0){ cmd.help.process(msg, ['get']); return;}
      if(params.length > 1) throw('Incorrect parameters. Type "'+prefix+'help get" for usage information.');
      if(params[0] === 'greetmsg') msg.channel.sendMessage('`'+params[0]+'` is currently set to: ```'+settings[msg.guild.id].greetmsg.msg+'``` and the status is currently: **'+util.getStatus(settings[msg.guild.id].greetmsg.status)+'** in the channel: **#'+settings[msg.guild.id].greetmsg.channel+'**');
      else if(params[0] === 'greetpm') msg.channel.sendMessage('`'+params[0]+'` is currently set to: ```'+settings[msg.guild.id].greetpm.msg+'``` and the status is currently: **'+util.getStatus(settings[msg.guild.id].greetpm.status)+'**');
      else if(params[0] === 'leavemsg') msg.channel.sendMessage('`'+params[0]+'` is currently set to: ```'+settings[msg.guild.id].leave.msg+'``` and the status is currently: **'+util.getStatus(settings[msg.guild.id].leave.status)+'**');
      else if(params[0] === 'logchannel') msg.channel.sendMessage('`'+params[0]+'` is currently set to: ```#'+settings[msg.guild.id].logs.channel+'``` and the status is currently: **'+util.getStatus(settings[msg.guild.id].logs.status)+'**');
      else if(params[0] === 'defaultrole') msg.channel.sendMessage('`'+params[0]+'` is currently set to: ```'+settings[msg.guild.id].defaultrole.name+'``` and the status is currently: **'+util.getStatus(settings[msg.guild.id].defaultrole.status)+'**');
      else throw('Unrecognized parameter "'+params[0]+'". Please specify either "greetmsg, "greetpm", "leavemsg", "logchannel", or "defaultrole". Type "'+prefix+'help get" for detailed usage information.');

    }
  }
}
