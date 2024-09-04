const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error("Error al abrir la base de datos", err.message);
    }
});

async function checkRank(client, userId, newXP, newLevel, previousLevel) {
    let roleId = null;
    const levels = [
        { level: 1, xpRequired: 20, roleId: '1213569512641921095' },  // "Rankless" rol
        { level: 10, xpRequired: 5120, roleId: 'ID_DEL_ROL_KNIGHT' },  // "Knight"
        { level: 20, xpRequired: 10240, roleId: 'ID_DEL_ROL_UNCOMMON_KNIGHT' },  // "Uncommon Knight"
        { level: 50, xpRequired: 51200, roleId: '1082051215413747923' }  // "Legendary Knight"
    ];

    // Encuentra el rol adecuado para el nuevo nivel
    for (const level of levels) {
        if (newLevel >= level.level) {
            roleId = level.roleId;
        } else {
            break;
        }
    }

    try {
        const member = await client.guilds.cache.first().members.fetch(userId);
        if (member) {
            const currentRoles = member.roles.cache;
            const currentRoleIds = currentRoles.map(role => role.id);

            // Elimina el rol anterior, si existe
            let roleToRemove = null;
            for (const level of levels) {
                if (currentRoleIds.includes(level.roleId) && level.level < newLevel) {
                    roleToRemove = level.roleId;
                }
            }

            if (roleToRemove) {
                await member.roles.remove(roleToRemove);
                console.log(`Rol ${roleToRemove} eliminado del usuario ${userId}.`);
            }

            // Asigna el nuevo rol
            if (roleId) {
                const newRole = member.guild.roles.cache.get(roleId);
                if (newRole) {
                    await member.roles.add(newRole);
                    console.log(`Rol ${roleId} asignado al usuario ${userId}.`);
                } else {
                    console.error(`No se encontró el rol con ID ${roleId}`);
                }
            }

            // Actualiza el apodo solo si el nivel ha cambiado
            if (newLevel !== previousLevel) {
                const originalNickname = member.nickname || member.user.username;
                const newNickname = `${originalNickname.split(' [')[0]} [${newLevel}]`;

                await member.setNickname(newNickname).then(() => {
                    console.log(`Apodo de ${userId} cambiado a ${newNickname}.`);
                }).catch(err => {
                    console.error(`No se pudo actualizar el apodo del usuario ${userId}:`, err);
                });

                // Obtener el canal desde la base de datos
                db.get("SELECT value FROM settings WHERE key = 'level_channel'", (err, row) => {
                    if (err || !row) {
                        return console.error("No se pudo obtener el canal para actualizaciones de nivel:", err.message);
                    }

                    const channelId = row.value;
                    const channel = client.channels.cache.get(channelId);

                    if (channel) {
                        channel.send(`¡${member.user.username} ha alcanzado el nivel **${newLevel}** con ${newXP} XP! Su apodo se ha actualizado a ${newNickname}.`);
                    } else {
                        console.error(`No se encontró el canal con ID ${channelId}`);
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error al asignar el rol o actualizar el apodo:", error);
    }
}

module.exports = { checkRank };
