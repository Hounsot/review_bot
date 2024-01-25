const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const token = '6977705572:AAHAOOCbxLq54G9p9ZHztJBU_K9v3S5fU9A'; // Replace with your token
// const manualUsers = ["@black_reaper228", "@kochuka"]
const userCategories = {
    Полиграфия: ["@AnnaDm4"], // Add usernames for Polygraphy
    Диджитал: ["@Sofi_Baeva", "@qeugens", "@kizerev", "@irareni", "@hounsout"], // Add usernames for Digital, note that users can be in multiple categories
    Моушен: ["@kizerev"] // Add usernames for Motion
};
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const GROUP_CHAT_ID = '-1002019157630'; // Replace with your group chat ID
// Function to select a random user from the chat members
let users = new Set();
let tempMessages = {}; // Object to store temporary messages

bot.on('message', (msg) => {
        if (msg.chat.type === 'private') {
        // Store the message temporarily
        tempMessages[msg.from.id] = {
            chatId: msg.chat.id,
            text: msg.text,
            fromId: msg.from.id
        };
            // Ask for the message type
        const opts = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Диджитал', callback_data: 'Диджитал' }],
                    [{ text: 'Полиграфия', callback_data: 'Полиграфия' }],
                    [{ text: 'Моушен', callback_data: 'Моушен' }],
                    [{ text: 'Наружка (Мастер макеты)', callback_data: 'Наружка' }],
                    [{ text: 'Гайд', callback_data: 'Гайд' }],
                    [{ text: 'Другое', callback_data: 'Другое' }]
                ]
            })
        };
// @ahmariina, @helga_kuu, @sasha_a3 @micrafon
        bot.sendMessage(msg.chat.id, 'Какой тип задачи?', opts);
    }
    bot.on('callback_query', (callbackQuery) => {
        try {
            const fromId = callbackQuery.from.id;
            if (tempMessages[fromId]) {
                const tempMessage = tempMessages[fromId];
                const messageType = callbackQuery.data; // 'Polygraphy', 'Digital', or 'Motion'
                
                const randomUsers = selectRandomUsersFromCategory(messageType, 2);
                const mentions = randomUsers.join(' ');
                const messageToSend = `#${messageType} ${tempMessage.text} ${mentions}`;
        
                bot.sendMessage(GROUP_CHAT_ID, messageToSend)
                    .catch((error) => {
                        console.error(error);
                        bot.sendMessage(tempMessage.chatId, "Error sending message: " + error.message);
                    });
        
                // Optional: Notify user that the message has been sent
                bot.sendMessage(tempMessage.chatId, 'Your message has been sent as ' + messageType);
        
                // Clear the stored message
                delete tempMessages[fromId];
            }
        } catch (error) {
            console.error('Callback Query Error:', error);
        }
    });
            // Collect user IDs from messages
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        users.add(msg.from.id);
    }

    // Command to get the group ID
    if (msg.text && msg.text.toString().toLowerCase().includes('/mygroupid')) {
        bot.sendMessage(msg.chat.id, "This group's chat ID is: " + msg.chat.id);
    }

    // Command to tag a random user
});
// function selectRandomUsers(userArray, count) {
//     // Shuffle the array and pick the first 'count' elements
//     let shuffled = userArray.sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, count);
// }
function selectRandomUsersFromCategory(category, count) {
    if (userCategories[category]) {
        let shuffled = userCategories[category].sort(() => 0.5 - Math.random());
        if (userCategories[category].length >= 2) {
            return shuffled.slice(0, count);
        }
        else {
            return shuffled.slice(0);
        }
    }
    return [];
}
function selectRandomUser(userArray) {
    if (userArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * userArray.length);
        return userArray[randomIndex];
    }
    return null;
}

console.log("Bot started...");
// const randomUsers = selectRandomUsers(Array.from(users), 2);
// console.log("Random Users: ", randomUsers); // Add this line for debugging
  