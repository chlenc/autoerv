const TelegramBot = require("node-telegram-bot-api");
const TOKEN = '549225375:AAE7UEnYDT7ThnnZ1dvmZ2XsD8gtsFBDPQM';
const bot = new TelegramBot(TOKEN, {
    polling: true
});

const TelegramCacheChatMessages = require('node-telegram-cache-chat-messages');
const casheMessages = new TelegramCacheChatMessages({
    bot,
    all: true,
    edited: true
});

const helpers = require('./helpers');
const keyboards = require('./keyboard');
const kb = require('./keyboard-buttons');
const frases = require("./frases");


bot.onText(/\/start/, msg => {
    helpers.start(msg)
    bot.sendMessage(msg.chat.id, msg.from.first_name + frases.to_start, keyboards.askPhone)
});
bot.onText(/\/help/, msg => {
    //firebase.database().ref('analytics/'+(new Date())).set(msg);
    bot.sendMessage(msg.chat.id, frases.help)
});
bot.onText(/\/chatId/, msg => {
    bot.sendMessage(msg.chat.id, msg.chat.id)
});
bot.onText(/\/about/, msg => {
    //firebase.database().ref('analytics/'+(new Date())).set(msg);
    bot.sendMessage(msg.chat.id, frases.about);
});
bot.onText(/\/home/, msg => {
    var chatId = msg.chat.id;
    helpers.removeOrder(chatId);
    bot.sendMessage(chatId, frases.to_go_home, keyboards.home)
});
bot.onText(/\/map/, msg => {
    bot.sendPhoto(msg.chat.id, frases.moscowMapUrl, keyboards.home);
    bot.sendMessage(msg.chat.id, frases.driver, keyboards.home)
})
bot.onText(/\/echo/, msg => {
    //helpers.echo()
})


bot.on('message', msg => {
        const chatId = msg.chat.id;

        if (msg.text === kb.goToHome) {
            helpers.removeOrder(chatId);
            bot.sendMessage(chatId, frases.to_go_home, keyboards.home);
        }
        else if (msg.text === kb.home.share) {
            bot.sendMessage(chatId, frases.share, keyboards.share)
        }
        else if (msg.contact) {
            helpers.addContact(msg)
            bot.sendMessage(msg.chat.id, frases.to_go_home, keyboards.home)
        }
        else if (msg.text === kb.home.about) {
            bot.sendMessage(chatId, frases.help)
        }
        //order
        else if (msg.text === kb.home.order || msg.text === kb.call_a_taxi.start) {
            helpers.callTaxi(bot, chatId)
        }
        else if (msg.location) {
            var location = {
                lat: msg.location.latitude,
                lng: msg.location.longitude
            };
            helpers.getAddressByLocation(location, function (err, address) {
                location.address = address.address;
                location.country = address.country;
                helpers.base.updateData('users/' + chatId + '/order', {start_location: location});
                bot.sendMessage(chatId, frases.startSubmit(location.address), keyboards.startSubmit);
            });

            // bot.sendMessage(chatId, frases.call_a_taxi.askEndLoc, keyboards.askEndTaxiLocation);
        }
        else if (msg.text === kb.call_a_taxi.end) {
            bot.sendMessage(chatId, frases.call_a_taxi.askEndLoc, keyboards.goToHome);
        }
        else if (msg.text === kb.call_a_taxi.confirm_end || msg.text === kb.call_a_taxi.no_cancel) {
            helpers.getResults(bot, chatId)
        }
        else if (msg.text === kb.call_a_taxi.yes_cancel) {
            helpers.removeOrder()
            bot.sendMessage(chatId, frases.to_go_home, keyboards.home);
        }
        else if (msg.text === kb.call_a_taxi.cancel) {
            bot.sendMessage(chatId, frases.call_a_taxi.askBeforeCancel, keyboards.cancel)
        }
        else if (msg.text === kb.call_a_taxi.confirm_order) {
            helpers.confirm_order(bot, chatId)
        }
        // else if (msg.text === kb.call_a_taxi.start) {
        //     bot.sendMessage(chatId, frases.to_call_taxi_start, {
        //         reply_markup: {
        //             force_reply: true
        //         }
        //     })
        // }
        // else if (msg.text === kb.call_a_taxi.end) {
        //     bot.sendMessage(chatId, frases.to_call_taxi_end, {
        //         reply_markup: {
        //             force_reply: true
        //         }
        //     })
        // }
        // else if (msg.reply_to_message) {
        //     // switch (msg.reply_to_message.text) {
        //     //     // case frases.to_call_taxi_start:
        //     //     //     helpers.getLocationByAddress(msg.text, function (err, location) {
        //     //     //         if (err === null) {
        //     //     //             helpers.getAddressByLocation(location, function (err, address) {
        //     //     //                 location.address = address.address;
        //     //     //                 location.country = address.country;
        //     //     //                 firebase.database().ref('users/' + chatId + '/order').update({
        //     //     //                     start_location: location
        //     //     //                 }).then(
        //     //     //                     result => {
        //     //     //                         bot.sendLocation(chatId, location.lat, location.lng)
        //     //     //                         bot.sendMessage(chatId, frases.call_a_taxi.askEndLoc, keyboards.askEndTaxiLocation);
        //     //     //                     },
        //     //     //                     error => {
        //     //     //                         bot.sendMessage(chatId, frases.call_a_taxi.addressError
        //     //     //                             , keyboards.askStartTaxiLocation);
        //     //     //                     })
        //     //     //             })
        //     //     //         }
        //     //     //         else {
        //     //     //             bot.sendMessage(chatId, frases.to_call_taxi_start, {
        //     //     //                 reply_markup: {
        //     //     //                     force_reply: true
        //     //     //                 }
        //     //     //             })
        //     //     //         }
        //     //     //     });
        //     //     //     break;
        //     //     case frases.to_call_taxi_end:
        //     //         try {
        //     //             helpers.getLocationByAddress(msg.text, function (err, location) {
        //     //                 if (err === null) {
        //     //                     bot.sendMessage(chatId, frases.pleaseWait);
        //     //                     // setTimeout({
        //     //                     helpers.getAddressByLocation(location, function (err, address) {
        //     //                         location.address = address.address;
        //     //                         location.country = address.country;
        //     //                         firebase.database().ref('users/' + chatId + '/order').update({
        //     //                             end_location: location
        //     //                         }).then(
        //     //                             result => {
        //     //                                 firebase.database().ref('users/' + chatId).once("value", function (snapshot) {
        //     //
        //     //                                     var order = snapshot.val().order;
        //     //                                     var start = order.start_location;
        //     //                                     var end = order.end_location;
        //     //                                     if (end == undefined) {
        //     //                                         bot.sendMessage(chatId, frases.call_a_taxi.askEndAgain, keyboards.askEndTaxiLocation);
        //     //                                         return
        //     //                                     }
        //     //                                     if (start == undefined || order === undefined) {
        //     //                                         firebase.database().ref('users/' + chatId + '/order').remove().catch();
        //     //                                         bot.sendMessage(chatId, 'Что-то пошло не так 😱', keyboards.goToHome);
        //     //                                         return
        //     //                                     }
        //     //                                     uber.estimates.getPriceForRouteAsync(start.lat, start.lng, end.lat, end.lng)
        //     //                                         .then(function (res) {
        //     //                                             firebase.database().ref('users/' + chatId + '/order').update({
        //     //                                                 price: {
        //     //                                                     low: res.prices[0].low_estimate,
        //     //                                                     high: res.prices[0].high_estimate
        //     //                                                 }
        //     //                                             });
        //     //                                             bot.sendLocation(chatId, location.lat, location.lng)
        //     //                                             bot.sendMessage(chatId, `Aдрес отправления 🛫: ${start.address}\nАдрес прибытия 🛬: ${end.address} \n\nСтоимость поездки: ${res.prices[0].low_estimate}₽ - ${res.prices[0].high_estimate}₽`, keyboards.confirm_order);
        //     //                                         })
        //     //                                         .error(function (err) {
        //     //                                             console.error(err);
        //     //                                         });
        //     //                                     // console.log(res)
        //     //
        //     //                                 }, function (errorObject) {
        //     //                                     console.log("The read failed: " + errorObject);
        //     //                                 });
        //     //                             },
        //     //                             error => {
        //     //                                 bot.sendMessage(chatId, frases.call_a_taxi.addressError, keyboards.askStartTaxiLocation);
        //     //                             }
        //     //                         );
        //     //                     })
        //     //
        //     //                     // },1000)
        //     //                 }
        //     //                 else {
        //     //                     bot.sendMessage(chatId, frases.to_call_taxi_start, {
        //     //                         reply_markup: {
        //     //                             force_reply: true
        //     //                         }
        //     //                     })
        //     //                 }
        //     //             });
        //     //         } catch (e) {
        //     //             console.log(e.toString())
        //     //         }
        //     //
        //     //         break;
        //     //     case 'Введите пожалуйста слудующие данные:\n ФИО, марка, модель авто, номер авто' :
        //     //         firebase.database().ref('users/' + chatId + '/driverInfo').set(msg.text).then(
        //     //             result => {
        //     //                 //bot.sendMessage(chatId,'Данные успешно сохранены',keyboards.home)
        //     //                 bot.sendMessage(chatId, frases.driver, keyboards.home)
        //     //             }
        //     //         )
        //     //         break;
        //     // }
        // }

        //order
        //application
        else if (msg.text === kb.home.driver) {
            helpers.checkDriverInfo(bot, chatId)

        }
        else if (msg.reply_to_message) {
            if (msg.reply_to_message.text === 'Введите ФИО') {
                helpers.base.updateData('users/' + chatId + '/driverInfo', {fio: msg.text})
                bot.sendMessage(chatId, 'Введите марку авто', {
                    reply_markup: {
                        force_reply: true
                    }
                })

            }
            else if (msg.reply_to_message.text === 'Введите марку авто') {
                helpers.base.updateData('users/' + chatId + '/driverInfo', {mark: msg.text})
                bot.sendMessage(chatId, 'Введите модель авто', {
                    reply_markup: {
                        force_reply: true
                    }
                })
            }
            else if (msg.reply_to_message.text === 'Введите модель авто') {
                helpers.base.updateData('users/' + chatId + '/driverInfo', {model: msg.text})
                bot.sendMessage(chatId, 'Введите номер авто в формате X777XX77', {
                    reply_markup: {
                        force_reply: true
                    }
                })
            }
            else if (msg.reply_to_message.text === 'Введите номер авто в формате X777XX77') {
                helpers.base.updateData('users/' + chatId + '/driverInfo', {gosNumber: msg.text})
                bot.sendMessage(chatId, frases.driver, keyboards.home)
            }
            //application
        }
        else {
            try {
                var messages = casheMessages.messages(chatId);
                var message = messages[messages.length - 2].text;
                if (message === kb.home.order || message === kb.call_a_taxi.start) {
                    helpers.getLocationByAddress(msg.text, function (err, location) {
                        if (err === null) {
                            helpers.getAddressByLocation(location, function (err, address) {
                                location.address = address.address;
                                location.country = address.country;
                                helpers.base.updateData('users/' + chatId + '/order', {start_location: location})
                                bot.sendLocation(chatId, location.lat, location.lng).then(() => {
                                    bot.sendMessage(chatId, frases.startSubmit(location.address), keyboards.startSubmit);
                                })
                            })
                        }
                        else {
                            bot.sendMessage(chatId, frases.call_taxi_start_error, keyboards.tryAskStartTaxiLocationAgain)
                        }
                    });
                } else if (message === kb.call_a_taxi.end) {
                    helpers.getLocationByAddress(msg.text, function (err, location) {
                        if (err === null) {
                            helpers.getAddressByLocation(location, function (err, address) {
                                location.address = address.address;
                                location.country = address.country;
                                helpers.base.updateData('users/' + chatId + '/order', {end_location: location});
                                bot.sendLocation(chatId, location.lat, location.lng).then(() => {
                                    bot.sendMessage(chatId, frases.endSubmit(location.address), keyboards.endSubmit);
                                })
                            })
                        }
                        else {
                            bot.sendMessage(chatId, frases.call_taxi_start_error, keyboards.tryAskEndTaxiLocationAgain)
                        }
                    });
                } else if (message === kb.home.driver) {
                    try {
                        var data = msg.text.split(';');
                        if (data.length !== 4 || data[3].length !== 8) {
                            helpers.checkDriverInfo(bot, chatId);
                            return
                        } else {
                            helpers.setDriverInfo(bot, chatId, data)
                        }
                    } catch (e) {
                        helpers.checkDriverInfo(bot, chatId);
                    }

                }
            } catch (e) {
                if (msg.text !== '/map' && msg.text !== '/start' && msg.text !== '/about' && msg.text !== '/help' && msg.text !== '/home' && msg.text !== '/echo' && msg.text !== '/chatId')
                    bot.sendMessage(chatId, helpers.getFrase(), keyboards.home)
            }
        }
    }
)

bot.on('callback_query', query => {
    const {chat, message_id, text} = query.message;
    try {
        var data = JSON.parse(query.data)
        // console.log(JSON.stringify(query, null, 4))
        // console.log(data)
        if (data.type == 'get_order') {
            helpers.getOrder(bot, query, data)
        }
        else if (data.type === 'revoke_nd') {
            helpers.revokeND(bot, query, data)
        }
        else if (data.type == 'revoke') {
            helpers.revokeOrder(bot, query, data)
        }


        else if (data.type == 'complete') {
            helpers.complete(bot, query, data)
        }
        else if (data.type == 'mark') {
            helpers.mark(bot, query, data)

        }
        else if (data.type == 'sndMark') {
            helpers.sendMark(bot, query, data)
        }
    } catch (e) {
    }

})

console.log('bot has been started')


