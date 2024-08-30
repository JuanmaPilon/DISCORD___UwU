require('dotenv').config();

const apikey = process.env.API_KEY;
const { Client,Events } = require("discord.js");


// crear el cliente
const client = new Client({
    intents: 3276799
});

// creo un evento
client.on(Events.ClientReady, async () => {
    console.log(`Conectado como ${client.user.username}`)
});

// agregar mensaje
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return; // si es un bot, no responde
    if(message.content === 'Gay' || message.content === 'gay') message.reply("El eze lamebolas");
})

// conectar cliente con la app
client.login(apikey)

