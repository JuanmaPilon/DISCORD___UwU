// utils.js

const levels = [
    { level: 1, xpRequired: 20 },
    { level: 2, xpRequired: 40 },
    { level: 3, xpRequired: 80 },
    // Continúa hasta el nivel deseado
];
const baseXP = 20; // XP Base para el nivel 1

for (let i = 1; i <= 100; i++) {
    const xpRequired = baseXP * Math.pow(2, i - 1);
    levels.push({ level: i, xpRequired: xpRequired, roleId: null }); // Inicialmente sin rol asignado
}



// Asocia roles específicos con ciertos niveles si lo deseas
levels[0].roleId = '1213569512641921095';  // Rol "Rankless"
levels[9].roleId = 'ID_DEL_ROL_KNIGHT';  // Rol "Knight" en nivel 10
levels[19].roleId = 'ID_DEL_ROL_UNCOMMON_KNIGHT';  // Rol "Uncommon Knight" en nivel 20
levels[49].roleId = '1082051215413747923';  // Rol "Legendary Knight" en nivel 50
// Añade más roles para niveles específicos si es necesario

async function checkRank(client, userId, newXP, newLevel) {
    let roleId = null;

    for (const level of levels) {
        if (newLevel === level.level) {
            roleId = level.roleId;
            break;
        }
    }

    try {
        const member = await client.guilds.cache.first().members.fetch(userId);
        if (member) {
            const currentRoles = member.roles.cache;
            const currentRoleIds = currentRoles.map(role => role.id);

            let roleToRemove = null;

            // Identificar si el usuario ya tiene un rol de nivel más alto o igual
            for (const level of levels) {
                if (currentRoleIds.includes(level.roleId) && level.level < newLevel) {
                    roleToRemove = level.roleId;
                }
            }

            if (roleToRemove) {
                await member.roles.remove(roleToRemove);
                console.log(`Rol ${roleToRemove} eliminado del usuario ${userId}.`);
            }

            if (roleId) {
                const newRole = member.guild.roles.cache.get(roleId);
                if (newRole) {
                    await member.roles.add(newRole);
                    console.log(`Rol ${roleId} asignado al usuario ${userId}.`);
                } else {
                    console.error(`No se encontró el rol con ID ${roleId}`);
                }

                const originalNickname = member.nickname || member.user.username;
                const newNickname = `${originalNickname.split(' | LvL ')[0]} | LvL ${newLevel}`;
                
                console.log(`Intentando cambiar el apodo de ${originalNickname} a ${newNickname} para el usuario ${userId}.`);

                await member.setNickname(newNickname).then(() => {
                    console.log(`Apodo de ${userId} cambiado a ${newNickname}.`);
                }).catch(err => {
                    console.error(`No se pudo actualizar el apodo del usuario ${userId}:`, err);
                });

                member.send(`¡Felicitaciones! Has alcanzado el nivel **${newLevel}** con ${newXP} XP. Se te ha asignado el rol correspondiente y se ha actualizado tu apodo a ${newNickname}.`);
            }
        }
    } catch (error) {
        console.error("Error al asignar el rol o actualizar el apodo:", error);
    }
}

module.exports = { checkRank };