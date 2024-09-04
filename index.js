const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// Cargar los comandos desde la carpeta 'commands'
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    
    // Depuración: Ver qué comando se está cargando
    console.log(`Cargando archivo de comando: ${file}`);
    console.log(`Contenido del comando:`, command);

    // Verificar si el comando tiene la estructura correcta
    if (!command.data || !command.data.name) {
        console.error(`El archivo ${file} no tiene la propiedad 'data' o 'name'.`);
        continue;  // Ignora este archivo y sigue con el siguiente
    }

    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    // Verificar si es un comando
    if (!interaction.isCommand()) return;

    console.log(`Comando recibido: ${interaction.commandName}`);  // Agregar este log

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);  // Ejecutar el comando
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
    }
});

// Iniciar sesión con el token del bot
client.once('ready', () => {
    console.log(`Conectado como ${client.user.tag}`);
});

client.login(token);
