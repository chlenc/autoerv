module.exports = {
    home: {
        order: 'Заказать такси 🚕',
        driver: 'Разместить заявку 🈸',
        about: 'О сервисе 🛃',
        share: 'Поделиться 🔗'
        // settings: 'Настройки ⚙'
    },
    call_a_taxi: {
        start: 'Ввести адрес отправления 🛫',
        end: 'Ввести адрес прибытия 🛬',
        confirm_order: 'Подтвердить 🚕✅',
        cancel: 'Отменить ❌',
        yes_cancel: 'Да, отменить ❌',
        no_cancel: 'Нет, не отменять ✅',
        // confirm_start:'Ввести адрес прибытия 🛬',
        confirm_end: 'Подтвердить адрес прибытия ✅'

    },
    askPhone: {
        text: '📲 Авторизация',
        request_contact: true
    },
    askGeo: {
        text: 'Отправить геолокацию 🛰 ',
        request_location: true
    },
    goToHome: 'Главное меню 🏠',
    askData: {
        text: 'Ввести данные',
        request_location: true
    },
    share: {
        text: 'Отправить бота другу',
        switch_inline_query: ' 👈 👍 🤖'
    },
    waitButton(value,temp) {
        return {
            text: 'Отменить ❌',
            callback_data: JSON.stringify({
                type: 'revoke_nd',
                country: temp,
                msg_id: value.message_id
            })
        }
    },
    channelGetButton(chatId) {
        return {
            text: 'Принять заказ',
            callback_data: JSON.stringify({
                type: 'get_order',
                id: chatId
            })
        }
    }

}