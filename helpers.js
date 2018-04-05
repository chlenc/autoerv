const request = require('request');
const firebase = require("firebase");
const frases = require('./frases')
const keyboards = require('./keyboard')
const kb = require('./keyboard-buttons')
firebase.initializeApp({
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


module.exports = {
    getLocationByAddress(address, callback) {
        address = cyrill_to_latin(address) + ', Moscow';
        const url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyAiNQKRVND4M5gH_DCVbYwYV3Ve-04pLBE";
        request(url, (error, response, body) => {
            try {
                if (!error && response.statusCode === 200) {
                    body = (JSON.parse(body));
                    var value = body.results[0].geometry.location;
                    // console.log(value)


                    callback(null, value);
                }

            } catch (e) {
                callback('error: ' + e.toString(), '');
                console.log(e.toString())
            }
        })
    },
    getAddressByLocation(location, callback) {
        location = location.lat + ',' + location.lng;
        const url = "https://maps.googleapis.com/maps/api/geocode/json?language=ru&latlng=" + location + "&key=AIzaSyAiNQKRVND4M5gH_DCVbYwYV3Ve-04pLBE";

        request(url, (error, response, body) => {
            try {
                if (!error && response.statusCode === 200) {
                    body = (JSON.parse(body));
                    // console.log(JSON.stringify(body,null,4))

                    var county = body.results[1].address_components[1].long_name;
                    var value = body.results[0].formatted_address.split(', Москва')[0];
                    callback(null, {
                        address: value,
                        country: county
                    });
                }

            } catch (e) {
                callback('error: ' + e.toString(), '');
                console.log(e.toString())
            }
        })
    },
    start(msg) {
        firebase.database().ref('users/' + msg.chat.id).set(msg.chat);
        //firebase.database().ref('analytics/'+(new Date())).set(msg);
    },
    sendHome(bot, chatId) {
        bot.sendPhoto(chatId, frases.label_url, {
                caption: frases.home,
                reply_markup: keyboard.home.reply_markup

            }
        )
    },
    addContact(msg) {
        var chatId = msg.chat.id;
        firebase.database().ref('users/' + chatId).update({
            phone_number: msg.contact.phone_number
        });
    },
    removeOrder(chatId) {
        firebase.database().ref('users/' + chatId + '/order')
    },
    callTaxi(bot, chatId) {
        firebase.database().ref('orders/' + chatId).once("value", function (snapshot) {
            if (snapshot.val() === null)
                bot.sendMessage(chatId, frases.call_a_taxi.askStartLoc, keyboards.askStartTaxiLocation);
            else
                bot.sendMessage(chatId, frases.call_a_taxi.calling_error, keyboards.home)
        });

    },
    getFrase() {
        var arr = ['Что?', 'Не понимаю', 'Еще раз', 'Что-что?', 'А?', 'Не понятно', 'Как вы сказали?', 'Как?', 'Такой ответ не пойдет'];
        return arr[getRandomInt(0, arr.length)]
    },
    base: {
        updateData(puth, data) {
            firebase.database().ref(puth).update(data)
        }
    },
    getResults(bot, chatId) {

        firebase.database().ref('users/' + chatId + '/order').once("value", function (snapshot) {
            var order = snapshot.val();
            if (order === null) {
                removeOrder(chatId);
                bot.sendMessage(chatId, frases.error_message, keyboards.goToHome);
                return;
            }
            var start = order.start_location;
            var end = order.end_location;
            if (start == undefined || end == undefined) {
                removeOrder(chatId);
                bot.sendMessage(chatId, frases.error_message, keyboards.goToHome);
                return;
            }

            uber.estimates.getPriceForRouteAsync(start.lat, start.lng, end.lat, end.lng)
                .then(function (res) {
                    firebase.database().ref('users/' + chatId + '/order').update({
                        price: {
                            low: res.prices[0].low_estimate,
                            high: res.prices[0].high_estimate
                        }
                    });
                    var message = frases.getOrderInfo(start.address, end.address, res.prices[0].low_estimate, res.prices[0].high_estimate);
                    bot.sendMessage(chatId, message, keyboards.confirm_order);
                })
                .error(function (err) {
                    removeOrder(chatId);
                    bot.sendMessage(chatId, frases.error_message, keyboards.goToHome);
                    console.error(err);

                    return;
                });
        });

    },
    confirm_order(bot, chatId) {
        firebase.database().ref('users/' + chatId).once("value", function (snapshot) {
            var user = snapshot.val();
            var country = user.order.start_location.country;
            firebase.database().ref('countries/').once("value", function (snapshot) {
                var data = snapshot.val()
                for (var temp in data) {
                    if (data[temp].title === country) {
                        var order = user.order;
                        var start = order.start_location;
                        var end = order.end_location;
                        var message = frases.getOrderInfo(start.address, end.address, order.price.low, order.price.high);
                        bot.sendMessage(temp, message, keyboards.chennalReply(chatId))
                            .then(function (value) {
                                bot.sendMessage(chatId, frases.call_a_taxi.confirm_order, keyboards.home);
                                bot.sendMessage(chatId, frases.waitMessage, {
                                    reply_markup: {
                                        inline_keyboard: [[{
                                            text: 'Отменить ❌',
                                            callback_data: JSON.stringify({
                                                type: 'revoke_nd',
                                                country: temp,
                                                msg_id: value.message_id
                                            })
                                        }]]
                                    }
                                });
                            });
                        return
                    }
                }
                removeOrder(chatId);
                bot.sendMessage(chatId, frases.bad_location, keyboards.goToHome);
            }, function (errorObject) {
                console.log("The read failed: " + errorObject);
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject);
        });
    },
    checkDriverInfo(bot, chatId) {
        firebase.database().ref(`users/${chatId}`).once("value", function (snapshot) {
            // console.log(snapshot.val().driverInfo)
            if (snapshot.val().driverInfo === undefined) {
                bot.sendMessage(chatId, 'Введите ФИО',{
                    reply_markup:{
                        force_reply: true
                    }
                })
            }
            else {
                if(snapshot.val().driverInfo.fio === undefined || snapshot.val().driverInfo.mark === undefined ||
                    snapshot.val().driverInfo.model === undefined ||
                    snapshot.val().driverInfo.gosNumber === undefined){
                    bot.sendMessage(chatId, 'Введите ФИО',{
                        reply_markup:{
                            force_reply: true
                        }
                    })
                }else {
                    bot.sendMessage(chatId, frases.driver, keyboards.home)
                }

            }
        }, function (errorObject) {
            console.log("The read failed: " + errorObject);
        });
    },
    setDriverInfo(bot, chatId, data) {
        firebase.database().ref('users/' + chatId + '/driverInfo').set({
            fio: data[0],
            mark: data[1],
            model: data[2],
            gosNumber: data[3]
        }).then(
            result => {
                bot.sendMessage(chatId, frases.driver, keyboards.home)
            }
        )
    },
    //
    getOrder(bot, query, data) {
        var passenger_id = data.id;
        try {
            if (query.from.id == passenger_id) {
                bot.sendMessage(passenger_id, 'Вы не можете везти сами себя 🤦🏻‍♀️🤷🏻‍♀️🙅🏻‍♀️')
            } else {
                bot.editMessageText('Выполняется', {
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id
                })
                try {
                    firebase.database().ref(`users/${passenger_id}`).once("value", function (snapshot) {
                        var user = snapshot.val();
                        if (user === null)
                            return;

                        var phone = user.phone_number;
                        var order = user.order;
                        if (order === null || order === undefined) {
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
                            , keyboards.getDriverEndKey(passenger_id, query.from.id, 0))
                            .then(msg => {
                                firebase.database().ref('orders/' + passenger_id + '/revoke/passenger').update({
                                    message_id: msg.message_id,
                                    chat_id: msg.chat.id
                                })
                            })

                        firebase.database().ref(`users/${query.from.id}`).once("value", function (snapshot) {
                            if(snapshot.val() !== null && snapshot.val().driverInfo !== undefined){
                                var driverInfo = snapshot.val().driverInfo;
                                bot.sendMessage(passenger_id, 'Ждите водителя\n' +
                                    `ФИО ${driverInfo.fio}\nМарка ${driverInfo.mark}\n Модель ${driverInfo.model}\n Госномер ${driverInfo.gosNumber}\n`+
                                    `Aдрес отправления 🛫: ${start.address}\nАдрес прибытия 🛬` +
                                    `: ${end.address} \nНомер водителя: ${snapshot.val().phone_number} \n\n` +
                                    `Стоимость поездки: ${order.price.low}₽ - ${order.price.high}₽`
                                    , keyboards.getPassengerEndKey(passenger_id, query.from.id, 0)).then(msg => {
                                    firebase.database().ref('orders/' + passenger_id + '/revoke/driver').update({
                                        message_id: msg.message_id,
                                        chat_id: msg.chat.id
                                    })
                                });
                            }

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
    },
    revokeND(bot, query, data) {
        bot.editMessageText('Пассажир отменил заказ', {
            chat_id: data.country,
            message_id: data.msg_id
        })
        firebase.database().ref('users/' + query.from.id + '/order').remove();
        firebase.database().ref('orders/' + query.from.id).remove();
        bot.editMessageText('Заказ отменен', {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        })
    },
    revokeOrder(bot, query, data) {
        firebase.database().ref(`orders/${data.id}`).once("value", function (snapshot) {
            var order = snapshot.val();
            if (order === null) {
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
    },
    complete(bot, query, data){
        firebase.database().ref(`orders/${data.id}`).once("value", function (snapshot) {
            var order = snapshot.val();
            if (order === null) {
                bot.sendMessage(query.from.id, 'Что-то пошло не так 😱', keyboards.goToHome);
                return
            }
            bot.editMessageText(`Поездка завершена\nК оплате ${order.order.price.high}₽ - ${order.order.price.low}₽.\n` +
                'Пожалуйста, оцените поездку', {
                chat_id: order.revoke.driver.chat_id,
                message_id: order.revoke.driver.message_id,
                reply_markup: keyboards.getDriverStars(order.revoke.passenger.chat_id, order.revoke.driver.message_id, 0)
            })
            bot.editMessageText(`Поездка завершена\nК оплате ${order.order.price.high}₽ - ${order.order.price.low}₽.\n` +
                'Пожалуйста, оцените поездку', {
                chat_id: order.revoke.passenger.chat_id,
                message_id: order.revoke.passenger.message_id,
                reply_markup: keyboards.getDriverStars(order.revoke.driver.chat_id, order.revoke.passenger.message_id, 0)
            })
        }, function (errorObject) {
            console.log("The read failed: " + errorObject);
        }).then(function () {
            firebase.database().ref(`orders/${data.id}`).remove()
        });
    },
    mark(bot,query,data){
        if (data.per === 'driv')
            var reply = keyboards.getDriverStars(data.to, query.from.id, data.mark);
        else
            var reply = keyboards.getPassengerStars(query.from.id, data.to, data.mark);

        bot.editMessageReplyMarkup(reply, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        })
    },
    sendMark(bot,query,data){
        firebase.database().ref(`reviews/${data.id}/${new Date()}`).set({
            mark: data.mark,
            from: query.from.id,
            // per: data.per
        })
        bot.editMessageText('Спасибо за отзыв', {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
            // reply_markup: keyboards.goToHome.reply_markup
        })
    },
    echo() {
        firebase.database().ref('countries/').update({
            '@testxhannnnel': {//sdasdsadsad
                id: '@testxhannnnel',
                title: "Восточный административный округ",
                url: 'https://t.me/testxhannnnel'
            }
        })
    }
}

function removeOrder(chatId) {
    firebase.database().ref('users/' + chatId + '/order')
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function cyrill_to_latin(text) {

    var arrru = new Array('Я', 'я', 'Ю', 'ю', 'Ч', 'ч', 'Ш', 'ш', 'Щ', 'щ', 'Ж',
        'ж', 'А', 'а', 'Б', 'б', 'В', 'в', 'Г', 'г', 'Д', 'д', 'Е', 'е', 'Ё', 'ё', 'З',
        'з', 'И', 'и', 'Й', 'й', 'К', 'к', 'Л', 'л', 'М', 'м', 'Н', 'н', 'О', 'о', 'П',
        'п', 'Р', 'р', 'С', 'с', 'Т', 'т', 'У', 'у', 'Ф', 'ф', 'Х', 'х', 'Ц', 'ц', 'Ы',
        'ы', 'Ь', 'ь', 'Ъ', 'ъ', 'Э', 'э');
    var arren = new Array('Ya', 'ya', 'Yu', 'yu', 'Ch', 'ch', 'Sh', 'sh', 'Sh',
        'sh', 'Zh', 'zh', 'A', 'a', 'B', 'b', 'V', 'v', 'G', 'g', 'D', 'd', 'E', 'e',
        'E', 'e', 'Z', 'z', 'I', 'i', 'J', 'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n',
        'O', 'o', 'P', 'p', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 'F', 'f', 'H', 'h',
        'C', 'c', 'Y', 'y', '`', '`', '\'', '\'', 'E', 'e');

    for (var i = 0; i < arrru.length; i++) {
        var reg = new RegExp(arrru[i], "g");
        text = text.replace(reg, arren[i]);
    }
    return text;
}