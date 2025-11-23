const { REST, Routes } = require('discord.js');
const { token, clientId } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Fetching all commands...');
    const commands = await rest.get(
      Routes.applicationCommands(clientId)
    );

    // Filter casino-related commands
    const casinoCommands = commands.filter(cmd =>
      ['casino', 'blackjack', 'slots', 'balance'].includes(cmd.name)
    );

    for (const command of casinoCommands) {
      await rest.delete(
        Routes.applicationCommand(clientId, command.id)
      );
      console.log(`Deleted command: ${command.name}`);
    }

    console.log('Finished deleting casino commands.');
  } catch (error) {
    console.error(error);
  }
})();
