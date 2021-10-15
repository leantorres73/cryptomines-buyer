const TelegramBot = require('node-telegram-bot-api');
var token = process.env.TELEGRAM_TOKEN;
const receiver = process.env.TELEGRAM_CHANNEL;
if (process.env.TELEGRAM_UP) {
  var bot = new TelegramBot(token, {polling: true});
}


export const sendMessage = (message: string) => {
  process.env.TELEGRAM_UP && bot.sendMessage(receiver, message);
}