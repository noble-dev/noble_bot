var jsf = require('jsonfile');
var request = require('request');
module.exports = {

  /* @quoted
  * Strips the passed in string of everything except what's between the quotation marks
  * Returns false if there are less than or more than TWO quotation marks
  */
  quoted: function(str){
    if((str.match(/"/g)||[]).length !== 2) throw('Improper usage of quotation marks. Must have no more/less than two.');
    else{
      return str.substring(str.indexOf('"')+1, str.lastIndexOf('"'));
    }
  },

  /* @showName
   * just a convenient way of returning a preformatted display name for a user in the form of 'nickname (username#discrim)'
   */
  showName: function(usr){
    if(usr.username === undefined) return ''+usr.displayName+' ('+usr.user.username+'#'+usr.user.discriminator+')';
    else throw('INTERNAL.ERROR - Value passed in must be of type GuildMember');
  },

  /*
   * checks if the passed in streamer is online
   */
  checkStreams: function(settings, msg, token){
    msg = msg || false;
    if(!msg) return false;
    var str = ':cinema: **`'+settings[msg.guild.id].name+' Streams`**\n';
    str += function(){
      let str = '';
      for(var i in settings[msg.guild.id].streams){
        let name = settings[msg.guild.id].streams[i];
        var options = {
          method: 'get',
          json: true,
          url: 'https://api.twitch.tv/kraken/streams/'+name+'?client_id='+token
        };
        request(options, function(error, response, body){
          if(body.stream !== null){
           str += '<http://twitch.tv/'+name+'> is currently **`LIVE`** - *`'+body.stream.channel.status+'`*\nPlaying: **`'+body.stream.game+'`** with *'+body.stream.viewers+' viewers*.\n';
          }
        });
      }
      return str;
    }
    console.log(str);
  },
  refresh: function(path, db){
    jsf.writeFileSync(path, db);
    console.log('>> Saved changes to '+path);
    return jsf.readFileSync(path);
  },
  initializeServer: function(msg, js, path, db){
    //if(db.hasOwnProperty(msg.guild.id)) return false;
    db[msg.guild.id] = {};
    db[msg.guild.id].id = msg.guild.id;
    db[msg.guild.id].name = msg.guild.name;
    db[msg.guild.id].owner = {
      "name": msg.guild.owner.user.username +'#'+msg.guild.owner.user.discriminator,
      "id": msg.guild.ownerId
    };
    db[msg.guild.id].joined = msg.guild.joinedAt;
    db[msg.guild.id].ignoreList = {};
    db[msg.guild.id].events = {};
    db[msg.guild.id].streams = [];
    db[msg.guild.id].greetmsg = {
      "msg": null,
      "status": false,
      "channel": null
    };
    db[msg.guild.id].greetpm = {
      "msg": null,
      "status": false
    };
    db[msg.guild.id].leave = {
      "msg": null,
      "status": false
    };
    db[msg.guild.id].defaultrole = {
      "name": null,
      "status": false
    };
    db[msg.guild.id].logs = {
      "channel": null,
      "status": false
    };
    jsf.writeFileSync(path, db);
    msg.channel.sendMessage('`Successfully initialized database settings for this server.`');
    console.log('>> Initialized settings for '+msg.guild.name);
    return jsf.readFileSync(path);
  },
  initializeCurrency: function(msg, path, obj){
    obj[msg.guild.id] = {
      name: 'tokens',
      enabled: true,
      members: {}
    }
    jsf.writeFileSync(path, obj);
    msg.channel.sendMessage('`Successfully initialized currency settings for this server.`');
    console.log('>> Initialized currency for ' + msg.guild.name);
    return jsf.readFileSync(path);
  },
  /*
   * Returns all the parameters that follow the command as an array. phrases within quotes are kept together.
   */
  parseParams: function(str){
    if((str.match(/"/g)||[]).length % 2 !== 0){
      throw('Cannot parse parameters - Uneven/non-matching number of quotation marks.');
    }
    return str.match(/(?:[^\s"]+|"[^"]*")+/g).map(function(x){return x.replace(/"/g, '')}).slice(1);

  },
  checkHasRole: function(guild, user, role){
    if(guild.member(user).roles.exists('name', role)) return true;
    else return false;
  },
  getStatus: function(bool){
    if(bool) return 'ON';
    else return 'OFF';
  },
  listSquads: function(squads, msg){ //accepts object of squads
    let str = "**`[NAME]             [CAPTAIN]`**";
    let space = "                  "; //18 length
    for(k in squad = Object.keys(squads)){
      str += '\n`'+squads[squad[k]].name+' '+space.substring(squads[squad[k]].name.length)+this.showName(msg.guild.member(squad[k]))+'`';
    }
    return str;
  },
  //returns true if user has one of the roles or perms, false if not
  checkPerms: function(permsarr, msg, member){
    member = member || msg.author;
    let perm = false;
    for(key in permsarr){
      if(permsarr[key] === '@everyone' || (permsarr[key][0] === '@' && msg.guild.member(member).roles.exists('name', permsarr[key].substring(1))) || (msg.guild.member(member).hasPermission(permsarr[key]))){
        perm = true;
        break;
      }
    }
    return perm;

  }

};
