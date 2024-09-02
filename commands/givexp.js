const sqlite3 = require('sqlite3').verbose();

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

async function checkRank(client,userId, newXP) {  // Marca la función como async
    let rank;
    let roleId;

    if (newXP < 100) {
        rank = 'Rankless';
        roleId = '1213569512641921095';  // Reemplaza con el ID real del rol
    } else if (newXP < 500) {
        rank = 'Knight';
        roleId = 'ID_DEL_ROL_KNIGHT';
    } else if (newXP < 1000) {
        rank = 'Uncommon Knight';
        roleId = 'ID_DEL_ROL_UNCOMMON_KNIGHT';
    } else {
        rank = 'Legendary Knight';
        roleId = '1082051215413747923';  // ID real del rol "Legendary Knight"
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
