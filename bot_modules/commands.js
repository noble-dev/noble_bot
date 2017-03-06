var commands = { //start2
  "ping":{ //start3
      usage: "`""ping`",
      description: "Responds with pong to see if the bot is alive.",
      process: function(bot, msg){
        msg.channel.sendMessage('pong!');
      }
  } //end3
}//end2

module.exports = commands;
