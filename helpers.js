//const firebase = require("firebase"); //goblin vonyaet ochen silno i protivnono ya vse revno ego lublu
const request = require('request');


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
                    var county = body.results[0].address_components[2].long_name;
                    var value = body.results[0].formatted_address.split(', Москва')[0];
                    // console.log(value)
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
    }
    // echo(bot){
    //     bot.getUpdates(1)
    //         .then(function(data)
    //         {
    //             console.log(data);
    //             console.log('SUCCESS!')
    //         })
    //         .catch(function(err)
    //         {
    //             console.log(err);
    //         })
    // }
    /*,
    getFrase(){
       var arr = ['Что?','Не понимаю','Еще раз','Что-что?','А?','Не понятно','Как вы сказали?','Как?','Такой ответ не пойдет'];
       return arr[getRandomInt(0, arr.length)]
    }*/

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