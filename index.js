const TelegramBot = require("node-telegram-bot-api");
const TOKEN = '549225375:AAE7UEnYDT7ThnnZ1dvmZ2XsD8gtsFBDPQM';
const URL = 'https://myxgplqupx.localtunnel.me';
// const Koa = require('koa');
// const Router = require('koa-router');
// var bodyParser = require('koa-bodyparser');
// const express = require('express');

const bot = new TelegramBot(TOKEN,{
    polling: true
});
// bot.deleteWebHook()
// bot.setWebHook(`${URL}/bot${TOKEN}`);
//
// const app = express();
// app.use(bodyParser())
// app.use(bot.getWebHookInfo(`/bot${TOKEN}`))
//
// bot.on('message', msg=>{
//     console.log(msg)
//     bot.sendMessage(msg.chat.id,'pong')
// })
//
// app.listen(8443, () => {
//     console.log(`Express listening on 8443`)
// })
//
//
//
// const app = new Koa();
// const router = new Router();
// router.post('/bot', ctx => {
//     const {body} = ctx.request
//     bot.processUpdate(body)
//     ctx.stats = 200
// })
//
// app.use(bodyParser())
// app.use(router.routes());
// app.listen(8000, () =>{
//     console.log('listening in 8000')
// })



const firebase = require("firebase");
firebase.initializeApp({
    //https://www.youtube.com/watch?v=G_FlX41qADE
    serviceAccount: "./autoServ-4b9341731ad0.json",
    databaseURL: "https://autoserv-fe564.firebaseio.com/"
});

var Uber = require('node-uber');
var uber = new Uber({
    client_id: 'cL9Ur810lcuyR-iEDLriy-Ra3uZbDk1x',
    client_secret: 'J2IQLKarJYF5b5pcseVtQ9V__zZCoG8IWDmCYVD1',
    server_token: 'NMFFzu8xhu1qlSoPDJOF__AtqNsFID5VYOWlLj_d',
    name: '@TaxiService_bot',
    language: 'ru_RU'
});

const helpers = require('./helpers');
const keyboards = require('./keyboard');
const kb = require('./keyboard-buttons');
const frases = require("./frases");

// var botan = require('botanio')(TOKEN);


// var uid = message.from.id;
// var url = 'https://github.com/'; // some url you want to send to user
// botan.shortenUrl(uid, url, function (err, res, body) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(body); // shortened url here
//     }
// });


bot.onText(/\/start/, msg => {
    // botan.track(msg, 'Start');
    firebase.database().ref('users/' + msg.chat.id).set(msg.chat);
    //firebase.database().ref('analytics/'+(new Date())).set(msg);
    bot.sendMessage(msg.chat.id, msg.from.first_name + frases.to_start, keyboards.askPhone)
});


bot.onText(/\/help/, msg => {
    //firebase.database().ref('analytics/'+(new Date())).set(msg);
    bot.sendMessage(msg.chat.id, msg.from.first_name + ',' + ' приветики').then(function (value) {
        console.log(value)
    })
});

bot.onText(/\/chatId/, msg => {
    bot.sendMessage(msg.chat.id, msg.chat.id, {})
});

bot.onText(/\/about/, msg => {
    //firebase.database().ref('analytics/'+(new Date())).set(msg);
    bot.sendMessage(msg.chat.id, frases.about, {});
});

bot.onText(/\/home/, msg => {
    var chatId = msg.chat.id;
    try {
        firebase.database().ref('users/' + chatId + '/order').remove(function (error) {
            console.log(error)
        });
    } catch (e) {
        console.log(e.toString())
    }
    bot.sendMessage(chatId, frases.to_go_home, keyboards.home)
})
bot.onText(/\/map/, msg => {
    bot.sendPhoto(msg.chat.id, frases.moscowMapUrl, keyboards.home);
    bot.sendMessage(msg.chat.id, frases.driver, keyboards.home)
})


// bot.onText(/\/е (.+)/, (source, match) => {
//
//     var chatId = msg.chat.id;
//     var target = msg.text.slice(3);
//
//     firebase.database().ref('users/'+chatId+'/order').update({
//         end_location: target
//     })
// console.log(target)
//
// })

bot.on('message', msg => {
    const chatId = msg.chat.id;
    // console.log(msg)
    //firebase.database().ref('analytics/'+(new Date())).set(msg);

    if (msg.text === kb.goToHome) {
        try {
            firebase.database().ref('users/' + chatId + '/order').remove();
        } catch (e) {
            console.log(e.toString())
        }
        bot.sendMessage(chatId, 'Вы можете заказать себе такси или сами стать перевозчиком. ', keyboards.home);
        // return
    }
    else if (msg.text === kb.home.share) {
        bot.sendMessage(chatId, "Поделитесь ботом", {
            reply_markup: {
                inline_keyboard:
                    [[{
                        text: 'Отправить бота другу',
                        switch_inline_query: ' 👈 👍 🤖'
                    }]]

            }
        })
    }

    //order
    else if (msg.text === kb.call_a_taxi.confirm_order) {
        firebase.database().ref('users/' + chatId).once("value", function (snapshot) {

            var user = snapshot.val();
            //console.log(user.order)
            var country = user.order.start_location.country;
            firebase.database().ref('countries/').once("value", function (snapshot) {
                var data = snapshot.val()
                for (var temp in data) {
                    // console.log(data[temp].title+'--'+country)
                    if (data[temp].title === country) {
                        var order = user.order;
                        var start = order.start_location;
                        var end = order.end_location;
                        bot.sendMessage(temp, `Aдрес отправления 🛫: ${start.address}\nАдрес прибытия 🛬: ${end.address} \n\nСтоимость поездки: ${order.price.low}₽ - ${order.price.high}₽`,
                            {
                                reply_markup: {
                                    inline_keyboard: [[{
                                        text: 'Принять заказ',
                                        callback_data: JSON.stringify({
                                            type: 'get_order',
                                            id: chatId
                                        })
                                    }]]
                                }
                            }).then(function (value) {
                            bot.sendMessage(chatId, frases.call_a_taxi.confirm_order, keyboards.home);
                            bot.sendMessage(chatId, 'Есди в ближайшее время с вами не свяжется водитель, то вы можете отменить заказ', {
                                reply_markup: {
                                    inline_keyboard: [[{
                                        text: kb.call_a_taxi.cancel,
                                        callback_data: JSON.stringify({
                                            type: 'revoke_nd',
                                            country: temp,
                                            msg_id: value.message_id
                                        })
                                    }]]
                                }
                            });
                        });
                    }
                }
            }, function (errorObject) {
                console.log("The read failed: " + errorObject);
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject);
        });
    }
    else if (msg.location) {
        var location = {
            lat: msg.location.latitude,
            lng: msg.location.longitude
        };
        helpers.getAddressByLocation(location, function (err, address) {
            location.address = address.address;
            location.country = address.country;
            firebase.database().ref('users/' + chatId + '/order').update({
                start_location: location
            });
        });
        bot.sendMessage(chatId, frases.call_a_taxi.askEndLoc, keyboards.askEndTaxiLocation);
    }
    else if (msg.contact) {
        firebase.database().ref('users/' + chatId).update(msg.contact);
        bot.sendMessage(msg.chat.id, msg.from.first_name + ', Вы успешно авторизовались', keyboards.home)
    }
    else if (msg.text === kb.home.order) {
        firebase.database().ref('orders/' + chatId).once("value", function (snapshot) {
            if (snapshot.val() === null)
                bot.sendMessage(chatId, frases.call_a_taxi.askStartLoc, keyboards.askStartTaxiLocation);
            else
                bot.sendMessage(chatId, 'Вы не можете вызвать такси пока не завершите или не отмените прошлую поездку' +
                    ' 🤦🏻‍♀️🤷🏻‍♀️🙅🏻‍♀️', keyboards.home)
        }, function (errorObject) {
            console.log("The read failed: " + errorObject);
        });


    }
    else if (msg.text === kb.call_a_taxi.start) {
        bot.sendMessage(chatId, frases.to_call_taxi_start, {
            reply_markup: {
                force_reply: true
            }
        })
    }
    else if (msg.text === kb.call_a_taxi.end) {
        bot.sendMessage(chatId, frases.to_call_taxi_end, {
            reply_markup: {
                force_reply: true
            }
        })
    }
    else if (msg.text === kb.call_a_taxi.cancel) {
        bot.sendMessage(chatId, frases.call_a_taxi.askBeforeCancel, keyboards.cancel)
    }
    else if (msg.text === kb.call_a_taxi.yes_cancel) {
        try {
            firebase.database().ref('users/' + chatId + '/order').remove();
        } catch (e) {
            console.log(e.toString())
        }
        bot.sendMessage(chatId, frases.to_go_home, keyboards.home);
    }
    else if (msg.reply_to_message) {
        switch (msg.reply_to_message.text) {
            case frases.to_call_taxi_start:
                helpers.getLocationByAddress(msg.text, function (err, location) {
                    if (err === null) {
                        helpers.getAddressByLocation(location, function (err, address) {
                            location.address = address.address;
                            location.country = address.country;
                            firebase.database().ref('users/' + chatId + '/order').update({
                                start_location: location
                            }).then(
                                result => {
                                    bot.sendLocation(chatId,location.lat,location.lng)
                                    bot.sendMessage(chatId, frases.call_a_taxi.askEndLoc, keyboards.askEndTaxiLocation);
                                },
                                error => {
                                    bot.sendMessage(chatId, frases.call_a_taxi.addressError
                                        , keyboards.askStartTaxiLocation);
                                })
                        })
                    }
                    else {
                        bot.sendMessage(chatId, frases.to_call_taxi_start, {
                            reply_markup: {
                                force_reply: true
                            }
                        })
                    }
                });
                break;
            case frases.to_call_taxi_end:
                try {
                    helpers.getLocationByAddress(msg.text, function (err, location) {
                        if (err === null) {
                            bot.sendMessage(chatId, frases.pleaseWait);
                            // setTimeout({
                            helpers.getAddressByLocation(location, function (err, address) {
                                location.address = address.address;
                                location.country = address.country;
                                firebase.database().ref('users/' + chatId + '/order').update({
                                    end_location: location
                                }).then(
                                    result => {
                                        firebase.database().ref('users/' + chatId).once("value", function (snapshot) {

                                            var order = snapshot.val().order;
                                            var start = order.start_location;
                                            var end = order.end_location;
                                            if (end == undefined) {
                                                bot.sendMessage(chatId, frases.call_a_taxi.askEndAgain, keyboards.askEndTaxiLocation);
                                                return
                                            }
                                            if (start == undefined || order === undefined) {
                                                firebase.database().ref('users/' + chatId + '/order').remove().catch();
                                                bot.sendMessage(chatId, 'Что-то пошло не так 😱', keyboards.goToHome);
                                                return
                                            }
                                            uber.estimates.getPriceForRouteAsync(start.lat, start.lng, end.lat, end.lng)
                                                .then(function (res) {
                                                    firebase.database().ref('users/' + chatId + '/order').update({
                                                        price: {
                                                            low: res.prices[0].low_estimate,
                                                            high: res.prices[0].high_estimate
                                                        }
                                                    });
                                                    bot.sendLocation(chatId,location.lat,location.lng)
                                                    bot.sendMessage(chatId, `Aдрес отправления 🛫: ${start.address}\nАдрес прибытия 🛬: ${end.address} \n\nСтоимость поездки: ${res.prices[0].low_estimate}₽ - ${res.prices[0].high_estimate}₽`, keyboards.confirm_order);
                                                })
                                                .error(function (err) {
                                                    console.error(err);
                                                });
                                            // console.log(res)

                                        }, function (errorObject) {
                                            console.log("The read failed: " + errorObject);
                                        });
                                    },
                                    error => {
                                        bot.sendMessage(chatId, frases.call_a_taxi.addressError, keyboards.askStartTaxiLocation);
                                    }
                                );
                            })

                            // },1000)
                        }
                        else {
                            bot.sendMessage(chatId, frases.to_call_taxi_start, {
                                reply_markup: {
                                    force_reply: true
                                }
                            })
                        }
                    });
                } catch (e) {
                    console.log(e.toString())
                }

                break;
            case 'Введите пожалуйста слудующие данные:\n ФИО, марка, модель авто, номер авто' :
                firebase.database().ref('users/'+chatId+'/driverInfo').set(msg.text).then(
                    result => {
                        //bot.sendMessage(chatId,'Данные успешно сохранены',keyboards.home)
                        bot.sendMessage(chatId,frases.driver,keyboards.home)
                    }
                )
                break;
        }
    }
    //order
    //application
    if (msg.text === kb.home.driver) {
        firebase.database().ref(`users/${chatId}`).once("value", function (snapshot) {
            // console.log(snapshot.val().driverInfo)
            if(snapshot.val().driverInfo === undefined){
                bot.sendMessage(chatId,'Введите пожалуйста слудующие данные:\n ФИО, марка, модель авто, номер авто',{
                    reply_markup: {
                                force_reply: true
                    }
                })
            }
            else {
                bot.sendMessage(chatId,frases.driver,keyboards.home)
            }
        }, function (errorObject) {
            console.log("The read failed: " + errorObject);
        });

    }
    //application

})
//522 389 413
bot.on('callback_query', query => {
    const {chat, message_id, text} = query.message;
    try {
        var data = JSON.parse(query.data)
        // console.log(JSON.stringify(query, null, 4))
        // console.log(data)
        if (data.type == 'get_order') {
            var passenger_id = data.id;
            try {
                if (query.from.id == passenger_id) {
                    bot.sendMessage(passenger_id, 'Вы не можете везти сами себя 🤦🏻‍♀️🤷🏻‍♀️🙅🏻‍♀️')
                }
                else {
                    bot.editMessageText('Выполняется', {
                        chat_id: chat.id,
                        message_id: message_id
                    })
                    try {
                        firebase.database().ref(`users/${passenger_id}`).once("value", function (snapshot) {
                            var user = snapshot.val();
                            var phone = user.phone_number;
                            var order = user.order;
                            if(order === null){
                                bot.sendMessage(query.from.id, 'Что-то пошло не так 😱', keyboards.goToHome);
                                return
                            }
                            var start = order.start_location;
                            var end = order.end_location;
                            firebase.database().ref('orders/' + passenger_id).set(
                                {
                                    phone_number: phone,
                                    first_name: user.first_name,
                                    order: user.order,
                                    date: new Date(),
                                    driver: query.from
                                }
                            );
                            firebase.database().ref('users/' + passenger_id + '/order').remove();
                            bot.sendMessage(query.from.id, 'Пассажир ждет вас\n' +
                                `Aдрес отправления 🛫: ${start.address}\nАдрес прибытия 🛬` +
                                `: ${end.address} \nНомер пассажира: ${phone} \n\n` +
                                `Стоимость поездки: ${order.price.low}₽ - ${order.price.high}₽`
                                , keyboards.getDriverEndKey(passenger_id, query.from.id, 0)).then(msg => {
                                firebase.database().ref('orders/' + passenger_id + '/revoke/passenger').update({
                                    message_id: msg.message_id,
                                    chat_id: msg.chat.id
                                })
                            })

                            firebase.database().ref(`users/${query.from.id}`).once("value", function (snapshot) {
                                bot.sendMessage(passenger_id, 'Ждите водителя\n' +
                                    `Aдрес отправления 🛫: ${start.address}\nАдрес прибытия 🛬` +
                                    `: ${end.address} \nНомер водителя: ${snapshot.val().phone_number} \n\n` +
                                    `Стоимость поездки: ${order.price.low}₽ - ${order.price.high}₽`
                                    , keyboards.getPassengerEndKey(passenger_id, query.from.id, 0)).then(msg => {
                                    firebase.database().ref('orders/' + passenger_id + '/revoke/driver').update({
                                        message_id: msg.message_id,
                                        chat_id: msg.chat.id
                                    })
                                });
                            }, function (errorObject) {
                                console.log("The read failed: " + errorObject);
                            });
                        }, function (errorObject) {
                            console.log("The read failed: " + errorObject);
                        });
                    } catch (e) {
                        console.log(e.toString())
                    }

                }

                // firebase.database.ref
            } catch (e) {
            }
        }
        else if (data.type === 'revoke_nd') {
            bot.editMessageText('Пассажир отменил заказ', {
                chat_id: data.country,
                message_id: data.msg_id
            })
            firebase.database().ref('users/' + query.from.id + '/order').remove();
            firebase.database().ref('orders/' + query.from.id).remove();
            bot.editMessageText('Заказ отменен', {
                chat_id: chat.id,
                message_id: message_id
            })

        }
        else if (data.type == 'mark') {
            // console.log(data);
            // return
            if (data.per === 'driv')
                var reply = keyboards.getDriverStars(data.to, query.from.id, data.mark);
            else
                var reply = keyboards.getPassengerStars(query.from.id, data.to, data.mark);

            bot.editMessageReplyMarkup(reply, {
                chat_id: chat.id,
                message_id: message_id
            })
        }
        else if (data.type == 'revoke') {
            firebase.database().ref(`orders/${data.id}`).once("value", function (snapshot) {
                var order = snapshot.val();
                if (order === null){
                    bot.sendMessage(query.from.id, 'Что-то пошло не так 😱', keyboards.goToHome);
                    return
                }
                bot.editMessageText('Заказ отменен', {
                    chat_id: order.revoke.driver.chat_id,
                    message_id: order.revoke.driver.message_id
                })
                bot.editMessageText('Заказ отменен', {
                    chat_id: order.revoke.passenger.chat_id,
                    message_id: order.revoke.passenger.message_id
                })
            }, function (errorObject) {
                console.log("The read failed: " + errorObject);
            }).then(function () {
                firebase.database().ref(`orders/${data.id}`).remove()
            });

        }
        else if (data.type == 'complete') {
            firebase.database().ref(`orders/${data.id}`).once("value", function (snapshot) {
                var order = snapshot.val();
                if (order === null){
                    bot.sendMessage(query.from.id, 'Что-то пошло не так 😱', keyboards.goToHome);
                    return
                }
                bot.editMessageText(`Поездка завершена\nК оплате ${order.order.price.high}₽ - ${order.order.price.low}₽.\n`+
                    'Пожалуйста, оцените поездку', {
                    chat_id: order.revoke.driver.chat_id,
                    message_id: order.revoke.driver.message_id,
                    reply_markup: keyboards.getDriverStars(order.revoke.passenger.chat_id,order.revoke.driver.message_id,0)
                })
                bot.editMessageText(`Поездка завершена\nК оплате ${order.order.price.high}₽ - ${order.order.price.low}₽.\n`+
                    'Пожалуйста, оцените поездку', {
                    chat_id: order.revoke.passenger.chat_id,
                    message_id: order.revoke.passenger.message_id,
                    reply_markup: keyboards.getDriverStars(order.revoke.driver.chat_id,order.revoke.passenger.message_id,0)
                })
            }, function (errorObject) {
                console.log("The read failed: " + errorObject);
            }).then(function () {
                firebase.database().ref(`orders/${data.id}`).remove()
            });
        }
        else if (data.type == 'sndMark') {
            firebase.database().ref(`reviews/${data.id}/${new Date()}`).set({
                mark: data.mark,
                from: query.from.id,
                // per: data.per
            })
            bot.editMessageText('Спасибо за отзыв',{
                chat_id: query.from.id,
                message_id: message_id
                // reply_markup: keyboards.goToHome.reply_markup
            })
        }
    } catch (e) {
    }

})

console.log('bot has been started')


