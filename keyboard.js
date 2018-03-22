const kb = require('./keyboard-buttons')

module.exports = {
    home: {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                [kb.home.order, kb.home.driver],
                [kb.home.about, kb.home.share]//kb.home.settings]
            ]//,
            //one_time_keyboard: true;
        }
    },
    askPhone: {
        reply_markup: {
            keyboard: [
                [kb.askPhone]
            ]
        }
    },
    askStartTaxiLocation: {
        reply_markup: {
            keyboard: [
                [kb.askGeo],
                [kb.call_a_taxi.start],
                [kb.goToHome]
            ]
        }
    },
    askEndTaxiLocation: {
        reply_markup: {
            keyboard: [
                [kb.call_a_taxi.end],
                [kb.goToHome]
            ]
        }
    },
    goToHome: {
        reply_markup: {
            keyboard: [
                [kb.goToHome]
            ]
        }
    },
    confirm_order: {
        reply_markup: {
            keyboard: [
                [kb.call_a_taxi.confirm_order],
                [kb.call_a_taxi.cancel]
            ]
        }
    },
    cancel: {
        reply_markup: {
            keyboard: [
                [kb.call_a_taxi.yes_cancel],
                [kb.call_a_taxi.no_cancel]
            ]
        }
    },
    getPassengerEndKey(pass, driv, mark) {
        // var stars = [];
        // var star;
        // for (var i = 1; i <= 5; i++) {
        //     star = '☆';
        //     if (i <= mark)
        //         star = '⭐';
        //     stars.push({
        //         text: star,
        //         callback_data: JSON.stringify({
        //             type: 'mark',
        //             mark: i,
        //             per: 'pass',
        //             // from: pass,
        //             to: driv
        //         })
        //     })
        // }
        return {
            reply_markup: {
                inline_keyboard: [
                    // stars,
                    [{
                        text: kb.call_a_taxi.cancel,
                        callback_data: JSON.stringify({
                            type: 'revoke',
                            id: pass
                            // from: pass,
                            // to: driv

                        })
                    }]
                ]
            }
        }
    },
    getPassengerStars(pass, driv, mark) {
        var stars = [];
        var star;
        for (var i = 1; i <= 5; i++) {
            star = '☆';
            if (i <= mark)
                star = '⭐';
            stars.push({
                text: star,
                callback_data: JSON.stringify({
                    type: 'mark',
                    mark: i,
                    per: 'pass',
                    // from: pass,
                    to: driv
                })
            })
        }
        return {
                inline_keyboard: [
                    stars,
                    [{
                        text: 'Оценить',
                        callback_data: JSON.stringify({
                            type:'sndMark',
                            mark: mark,
                            id: driv,
                            per: 'pass'
                        })
                    }]
                ]
        }
    },
    getDriverEndKey(pass, driv, mark) {
        // var stars = [];
        // var star;
        // for (var i = 1; i <= 5; i++) {
        //     star = '☆';
        //     if (i <= mark)
        //         star = '⭐';
        //     stars.push({
        //         text: star,
        //         callback_data: JSON.stringify({
        //             type: 'mark',
        //             mark: i,
        //             per: 'driv',
        //             // from: driv ,
        //             to: pass
        //         })
        //     })
        // }
        return {
            reply_markup: {
                inline_keyboard: [
                    // stars,
                    [{
                        text: 'Поездка завершена',
                        callback_data: JSON.stringify({
                            type: 'complete',
                            id: pass
                        })
                    }],
                    [{
                        text: kb.call_a_taxi.cancel,
                        callback_data: JSON.stringify({
                            type: 'revoke',
                            id: pass
                            // from: driv ,
                            // to: pass
                        })
                    }]
                ]
            }
        }
    },
    getDriverStars(pass, driv, mark) {
        var stars = [];
        var star;
        for (var i = 1; i <= 5; i++) {
            star = '☆';
            if (i <= mark)
                star = '⭐';
            stars.push({
                text: star,
                callback_data: JSON.stringify({
                    type: 'mark',
                    mark: i,
                    per: 'driv',
                    // from: driv ,
                    to: pass
                })
            })
        }
        return {
            inline_keyboard: [
                stars,
                [{
                    text: 'Оценить',
                    callback_data: JSON.stringify({
                        type:'sndMark',
                        mark: mark,
                        id: pass,
                        per: 'driv'
                    })
                }]
            ]
        }
    }
}