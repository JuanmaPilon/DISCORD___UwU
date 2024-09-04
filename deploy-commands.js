const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    {
        name: 'avatar',
        description: 'Muestra el avatar de un usuario',
    },
    {
        name: 'say',
        description: 'Repite lo que dices',
        options: [
            {
                name: 'mensaje',
                description: 'El mensaje que quieres que repita el bot',
                type: 3,  // 3 es para cadenas de texto
                required: true
            }
        ]
    },
    {
        name: 'setlevelchannel',
        description: 'Selecciona el canal donde se enviarán las actualizaciones de nivel',
        options: [
            {
                name: 'canal',
                description: 'Selecciona un canal de texto',
                type: 7,  // 7 es para seleccionar un canal
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Registrando los comandos slash.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Comandos slash registrados exitosamente.');
    } catch (error) {
        console.error(error);
    }
})();
