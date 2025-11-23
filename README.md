# Discord Shop Manager Bot

This is a Discord bot made for managing a server shop.  
It handles orders, messages, notifications, and some basic moderation tools.

## Features

### Shop & Order Tools
- **Slot Creation System:** lets you open and manage shop “slots” for customers.
- **TOS System:** sends or displays your Terms of Service when needed.
- **Receipt Email System:** after a customer buys something, the bot sends their receipt to their email automatically.
- **PayPal Setup:** simple command to set or show the server’s PayPal address.

### Messaging Tools
- **Send a message to every channel** in the server.
- **Send a custom message to a specific member** in their DMs.
- **Notify Command:** pings a certain member and tells them to come to the channel where the command was used.

### Moderation Tools
- Basic moderation commands (kick, ban, clear, etc., depending on what you added).

## How to Run
  
1. Install Node.js if you don't have it.
2. Make sure you installed your bot’s dependencies with:
' npm install dotenv discord.js ms axios nodemailer'

3. Add your bot token inside an `.env` or config file.
4. Start the bot:
'node bot.js'


## File Structure
- **bot.js** → main bot file  
- Other files and folders contain commands, handlers, or configs (depending on your setup).

## Reminder
Never put your Discord bot token inside your public code.  
Use a `.env` file or environment variables instead.





