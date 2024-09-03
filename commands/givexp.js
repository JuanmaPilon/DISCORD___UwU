const sqlite3 = require('sqlite3').verbose(); 
const { checkRank } = require('../utils.js');

module.exports = {
    description: 'Otorga XP a un usuario especificado',
    run: async (message, client) => {
        // tiene que checkear que tenga addmin
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('No tienes permisos para usar este comando.');
        }

        // Extraer el usuario mencionado y la cantidad de XP
        const args = message.content.split(' ');
        const user = message.mentions.users.first();
        const xpAmount = parseInt(args[2], 10);

        console.log('Args:', args);
        console.log('User:', user); 
        console.log('XP Amount:', xpAmount); 


        if (!user || isNaN(xpAmount)) {
            return message.reply('Debes mencionar a un usuario válido y especificar una cantidad de XP.');
        }

        // conecta con bd
        const db = new sqlite3.Database('./xp.sqlite');

        // le da la xp
        db.get("SELECT xp FROM xp WHERE userId = ?", [user.id], (err, row) => {
            if (err) {
                console.error("Error al recuperar XP", err.message);
                return message.reply('Ocurrió un error al otorgar XP.');
            }

            let newXP = xpAmount;
            if (row) {
                newXP += row.xp;
            }

            db.run("INSERT INTO xp (userId, xp) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET xp = ?", [user.id, newXP, newXP], (err) => {
                if (err) {
                    console.error("Error al actualizar XP", err.message);
                    return message.reply('Ocurrió un error al actualizar el XP.');
                }

                // checkea el rango
                checkRank(client, user.id, newXP);

                message.reply(`Se han otorgado ${xpAmount} XP a <@${user.id}>. Ahora tiene ${newXP} XP.`);
            });
        });

        // cierra la conexion con la BD
        db.close();
    }
};


