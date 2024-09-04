const { calculateLevel } = require('./levels');
const { checkRank } = require('./utils');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error("Error al abrir la base de datos", err.message);
    } else {
        console.log("Conectado a la base de datos SQLite");
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

function giveXP(client, userId, timeSpent) { 
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
            currentLevel = row.level || 0;
        } else {
            console.log(`No se encontró registro para el usuario ${userId}. Se creará un nuevo registro.`);
        }

        const newLevel = calculateLevel(newXP);

        console.log(`Nuevo nivel calculado para el usuario ${userId}: ${newLevel}`);

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

module.exports = { giveXP };
