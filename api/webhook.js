const { Telegraf, session } = require('telegraf'); // Import session from telegraf

// Initialize the bot with the bot token from environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);

// Use built-in session middleware
bot.use(session());

// Start command handler
bot.start((ctx) => {
    ctx.reply('Welcome! Please enter the recent win (animal or bird):');
});

// Handle user input for recent win
bot.on('text', (ctx) => {
    const recentWin = ctx.message.text.trim().toLowerCase();

    // Check if input is valid
    const validAnimals = ['m', 'r', 'l', 'p']; // Money, Rabbit, Lion, Panda
    const validBirds = ['s', 'p', 'e']; // Swallow, Pigeon, Peacock, Eagle

    if (validAnimals.includes(recentWin) || validBirds.includes(recentWin)) {
        ctx.session.recentWin = recentWin;
        ctx.reply('Do you want to check if the same animal or bird won recently? (yes/no)');
    } else {
        ctx.reply('Invalid input. Please enter a valid animal or bird.');
    }
});

// Handle confirmation for checking recent trend
bot.on('text', (ctx) => {
    if (ctx.session.recentWin) {
        const confirmation = ctx.message.text.trim().toLowerCase();

        if (confirmation === 'yes') {
            ctx.reply('Please enter the previous win:');
            ctx.session.checkTrend = true; // Set flag to check trend
        } else if (confirmation === 'no') {
            ctx.reply('Thank you! You can start again by typing /start.');
            delete ctx.session.recentWin; // Clear session data
        } else {
            ctx.reply('Please respond with yes or no.');
        }
    }
});

// Handle previous win input
bot.on('text', (ctx) => {
    if (ctx.session.checkTrend) {
        const previousWin = ctx.message.text.trim().toLowerCase();
        
        // Process the previous win and provide predictions
        ctx.reply(`You entered: ${previousWin}. Now generating predictions...`);

        // Generate predictions based on previous wins
        const predictions = generatePredictions(previousWin);
        
        ctx.reply(`Predicted Pattern:\n${predictions.join('\n')}`);

        // Clear session data after processing
        delete ctx.session.checkTrend;
        delete ctx.session.recentWin;
    }
});

// Function to generate predictions based on previous win
function generatePredictions(previousWin) {
    const animalsAndBirds = ['Money (M)', 'Rabbit (R)', 'Lion (L)', 'Panda (P)', 'Swallow (S)', 'Pigeon (P)', 'Peacock (P)', 'Eagle (E)'];
    
    // Randomly pick 4 predictions from the list of animals and birds
    return getRandomUniqueNumbers(4, animalsAndBirds.length).map(index => animalsAndBirds[index]);
}

// Function to get unique random numbers for predictions
function getRandomUniqueNumbers(count, max) {
    const numbers = new Set();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * max));
    }
    return Array.from(numbers);
}

// Handle webhook for Vercel deployment
module.exports = async (req, res) => {
    try {
        await bot.handleUpdate(req.body); // Handle incoming updates from Telegram
        res.status(200).send(); // Respond with 200 OK using status and send method
    } catch (error) {
        console.error('Error handling update:', error);
        res.status(500).send({ error: 'Internal Server Error' }); // Respond with error message for internal server error
    }
};
