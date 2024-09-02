require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Client, Events } = require("discord.js");
const apikey = process.env.API_KEY;

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
        // si no existe crea la tabla
        db.run("CREATE TABLE IF NOT EXISTS xp (userId TEXT PRIMARY KEY, xp INTEGER)", (err) => {
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
    const userId = newState.id;

    if (!oldState.channelId && newState.channelId) {
        userActivity.set(userId, Date.now()); // almacena el tiempo de conexión
    }  // si el usuario sale de un canal de voz
    else if (oldState.channelId && !newState.channelId) {
        const joinTime = userActivity.get(userId);
        if (joinTime) {
            const timeSpent = Date.now() - joinTime;
            userActivity.delete(userId); // limpia luego del cálculo
            giveXP(userId, timeSpent); // le da la exp
        }
    }
});

// function para dar la xp
function giveXP(userId, timeSpent) {
    const minutesSpent = Math.floor(timeSpent / 60000); // convertir a minutos
    const xpEarned = minutesSpent;

    db.get("SELECT xp FROM xp WHERE userId = ?", [userId], (err, row) => {
        if (err) {
            console.error("Error al recuperar XP", err.message);
        } else {
            let newXP = xpEarned;
            if (row) {
                newXP += row.xp;
            }
            db.run("INSERT INTO xp (userId, xp) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET xp = ?", [userId, newXP, newXP], (err) => {
                if (err) {
                    console.error("Error al actualizar XP", err.message);
                }
                checkRank(userId, newXP);
            });
        }
    });
}

// checkea el rank del usuario
async function checkRank(userId, newXP) { 
    let rank;
    let roleId;

    if (newXP < 100) {
        rank = 'Rankless';
        roleId = '1213569512641921095';
    } else if (newXP < 500) {
        rank = 'Knight';
        roleId = 'ID_DEL_ROL_KNIGHT';
    } else if (newXP < 1000) {
        rank = 'Uncommon Knight';
        roleId = 'ID_DEL_ROL_UNCOMMON_KNIGHT';
    } else {
        rank = 'Legendary Knight';
        roleId = '1082051215413747923'; 
    }

    try {
        const member = await client.guilds.cache.first().members.fetch(userId);  // Usar await para obtener el miembro
        if (member) {
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);  // Asignar el rol al usuario
                member.send(`¡Felicitaciones! Has alcanzado el rango de **${rank}** con ${newXP} XP y se te ha asignado el rol correspondiente.`);
            } else {
                console.error(`No se encontró el rol con ID ${roleId}`);
            }
        }
    } catch (error) {
        console.error("Error al asignar el rol:", error);
    }
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
