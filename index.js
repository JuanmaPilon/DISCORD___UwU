require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Client, Events } = require("discord.js");
const apikey = process.env.API_KEY;
const { checkRank } = require('./utils.js');

const userActivity = new Map(); // Esto debería estar al principio del archivo index.js


// creo el client
const client = new Client({
    intents: 3276799
});

// conecta con la bd
const db = new sqlite3.Database('./xp.sqlite', (err) => {
    if (err) {
        console.error("Error al abrir la base de datos", err.message);
    } else {
        console.log("Conectado a la base de datos SQLite");
        // Crear la tabla si no existe o si la has eliminado
        db.run(`CREATE TABLE IF NOT EXISTS xp (
            userId TEXT PRIMARY KEY,
            xp INTEGER,
            level INTEGER
        )`, (err) => {
            if (err) {
                console.error("Error al crear la tabla XP", err.message);
            }
        });
    }
});

// si el cliente esta listo con async
client.on(Events.ClientReady, async () => {
    console.log(`Conectado como ${client.user.username}`);
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    const userId = newState.id || oldState.id;

    if (!oldState.channelId && newState.channelId) {
        console.log(`Usuario ${userId} se conectó a un canal de voz.`);
        userActivity.set(userId, Date.now());
    } else if (oldState.channelId && !newState.channelId) {
        console.log(`Usuario ${userId} se desconectó de un canal de voz.`);
        const joinTime = userActivity.get(userId);
        if (joinTime) {
            const timeSpent = Date.now() - joinTime;
            userActivity.delete(userId);
            giveXP(userId, timeSpent);
        }
    }
});

// function para dar la xp
function giveXP(userId, timeSpent) {
    const minutesSpent = Math.floor(timeSpent / 60000); // convertir a minutos
    const xpEarned = minutesSpent;

    console.log(`XP ganada: ${xpEarned} minutos.`);

    db.get("SELECT xp, level FROM xp WHERE userId = ?", [userId], (err, row) => {
        if (err) {
            return console.error("Error al recuperar XP", err.message);
        }

        let newXP = xpEarned;
        let currentLevel = 0;

        if (row) {
            console.log(`Registro encontrado para el usuario ${userId}: XP = ${row.xp}, Nivel = ${row.level}`);
            newXP += row.xp;
            currentLevel = row.level || 0; // Asegúrate de que currentLevel sea 0 si no existe
        } else {
            console.log(`No se encontró registro para el usuario ${userId}. Se creará un nuevo registro.`);
        }

        console.log(`XP total para el usuario ${userId}: ${newXP}, Nivel actual: ${currentLevel}`);

        // Calcular el nuevo nivel basado en la XP actual
        let newLevel = 0;
        for (const level of levels) {
            if (newXP >= level.xpRequired) {
                newLevel = level.level;
            } else {
                break;
            }
        }

        console.log(`Nuevo nivel calculado para el usuario ${userId}: ${newLevel}`);

        // Aquí se inserta o actualiza la base de datos
        db.run("INSERT INTO xp (userId, xp, level) VALUES (?, ?, ?) ON CONFLICT(userId) DO UPDATE SET xp = ?, level = ?", 
               [userId, newXP, newLevel, newXP, newLevel], (err) => {
            if (err) {
                return console.error("Error al actualizar XP y Nivel", err.message);
            }
            console.log(`XP y nivel actualizados en la base de datos para el usuario ${userId}.`);
            checkRank(client, userId, newXP, newLevel); // Pasar también el nuevo nivel a checkRank
        });
    });
}



// message handler
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    try {
        const command = require(`./commands/${commandName}`);
        command.run(message, client);
    } catch (error) {
        console.log(`Error ejecutando el comando -${commandName}:`, error.message);
    }
});

// conecto el client
client.login(apikey);
