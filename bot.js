const TelegramBot = require('node-telegram-bot-api');
const Airtable = require('airtable');
Airtable.configure({
    apiKey: 'YOUR_AIRTABLE_API_KEY'
});
const base = Airtable.base('YOUR_BASE_ID');
function getAirtableData() {
    // Your logic to get data from Airtable
}
const schedule = require('node-schedule');
const token = '6977705572:AAHAOOCbxLq54G9p9ZHztJBU_K9v3S5fU9A'; // Replace with your token
// const manualUsers = ["@black_reaper228", "@kochuka"]
const userCategories = {
    Полиграфия: [364866404, 645420517], 
    Диджитал: [364866404, 645420517],
    Моушен: [364866404, 645420517]
};
// 645420517, 364866404
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const GROUP_CHAT_ID = '-1002019157630'; // Replace with your group chat ID
// Create variables to store temporary data
let users = new Set();
let tempMessages = {}; // Object to store temporary messages
// Listen for incoming messages
bot.on('message', (msg) => {
    // Get the user's ID
    const userId = msg.from.id;
    // Ignore non-text messages
    if (!msg.text) return;
    // Check if a user is responding to a previous message
    if (tempMessages[userId] && tempMessages[userId].waitingForResponse) {
        // Get the original sender's ID
        const originalSenderId = tempMessages[userId].waitingForResponse.fromId;
        // Send a response message to the original sender
        bot.sendMessage(originalSenderId, `Response to your message: ${msg.text}`);
        // Log the action of sending a response
        console.log(`Sending response from user ${userId} to original sender ${originalSenderId}`)
        // Delete the waitingForResponse flag to indicate the response has been handled
        delete tempMessages[userId].waitingForResponse;
    } else if (msg.chat.type === 'private') {
        // Handling new message
        tempMessages[userId] = {
            text: msg.text,
            fromId: userId,
            type: null,
            waitingForResponse: false
        };
        const categoryKeyboard = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Полиграфия', callback_data: 'Полиграфия' }],
                    [{ text: 'Диджитал', callback_data: 'Диджитал' }],
                    [{ text: 'Моушен', callback_data: 'Моушен' }]
                ]
            })
        };
        bot.sendMessage(userId, 'Какой тип задачи?', categoryKeyboard);
    }
});

bot.on('callback_query', (callbackQuery) => {
    const fromId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (!tempMessages[fromId]) {
        console.log("No temporary message found for user:", fromId);
        return;
    }

    if (data === 'Ответить') {
        // Setup for user response
        tempMessages[fromId].waitingForResponse = {
            fromId: tempMessages[callbackQuery.message.chat.id].fromId
        };
        console.log("Setting up response for user:", fromId); // Debug log
        bot.sendMessage(fromId, "Please type your response message:");
    } else if (Object.keys(userCategories).includes(data)) {
        // Handle category selection
        handleCategorySelection(fromId, data);
    } else {
        console.log("Unhandled callback data:", data); // Debug log for unhandled data
    }
});

function handleCategorySelection(fromId, messageType) {
    tempMessages[fromId].type = messageType;
    const randomUsers = selectRandomUsersFromCategory(messageType, 2, fromId);

    randomUsers.forEach(userId => {
        const responseKeyboard = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Ответить', callback_data: 'Ответить' }],
                    [{ text: 'Занят/Дейофф', callback_data: 'Занят/Дейофф' }]
                ]
            })
        };
        bot.sendMessage(userId, `#${messageType}\n${tempMessages[fromId].text}`, responseKeyboard);
    });
}
function selectRandomUsersFromCategory(category, count, excludeUserId) {
    const usersInCategory = userCategories[category] || [];
    const eligibleUsers = usersInCategory.filter(id => id !== excludeUserId);
    return selectRandomUsers(eligibleUsers, count);
}

function selectRandomUsers(userArray, count) {
    const shuffled = userArray.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}


console.log("Bot started...");
