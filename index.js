require('dotenv').config();

const apikey = process.env.API_KEY;
const { Client, Events } = require("discord.js");

// Crear el cliente
const client = new Client({
    intents: 3276799
});

// Evento cuando el cliente está listo
client.on(Events.ClientReady, async () => {
    console.log(`Conectado como ${client.user.username}`);
});

// Manejar mensajes
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    try {
        const command = require(`./commands/${commandName}`);
        command.run(message);
    } catch (error) {
        console.log(`Error ejecutando el comando -${commandName}:`, error.message);
    }
});

// Conectar cliente con la app
client.login(apikey);
