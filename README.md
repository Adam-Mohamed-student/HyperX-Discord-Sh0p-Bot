# Discord Shop Manager Bot

This is a Discord bot made for managing a server shop.  
It handles orders, messages, notifications, and some basic moderation tools.

## Features

### Shop & Order Tools
- **Slot Creation System:** lets you open and manage shop “slots” for customers.
- **TOS System:** sends or displays your Terms of Service when needed.
- **Receipt Email System:** after a customer buys something, the bot sends their receipt to the customer’s email.
- **PayPal Setup:** command to set or show the server’s PayPal address.

### Messaging Tools
- Send a message to every channel in the server.
- Send a message directly to a specific member’s DMs.
- **Notify Command:** tells a selected member to come to the channel where the command was used.

### Moderation Tools
- Basic commands like kick, ban, clear, and others.

## How to Run
  
1. Install `Node.js` if you don't have it.
2. Install the required packages:
`npm install dotenv discord.js ms axios nodemailer`
3. Add your bot token inside an `.env` file or config file.
4. Start the bot:
`node bot.js`


## Important Setup (Channel, Category, Role IDs)

Inside **bot.js**, you must replace the example IDs with your own server’s IDs:

```js
const CATEGORIES = {
 CATEGORY_1: 'YOUR_CATEGORY_ID_1',
 CATEGORY_2: 'YOUR_CATEGORY_ID_2'
};

const LOG_CHANNEL_ID = 'YOUR_LOG_CHANNEL_ID';
const TRANSCRIPT_CHANNEL_ID = 'YOUR_TRANSCRIPT_CHANNEL_ID';

// Allowed role IDs for new commands
const ALLOWED_ROLES = [
 'ROLE_ID_1',
 'ROLE_ID_2',
 'ROLE_ID_3',
 'ROLE_ID_4'
];
