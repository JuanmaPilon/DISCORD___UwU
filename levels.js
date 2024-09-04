// Genera niveles dinámicamente hasta el nivel 100 con progresión exponencial
function generateLevels(maxLevel = 100, baseXP = 20) {
    const levels = [];
    for (let i = 1; i <= maxLevel; i++) {
        const xpRequired = baseXP * Math.pow(2, i - 1);
        levels.push({ level: i, xpRequired: xpRequired });
    }
    return levels;
}

const levels = generateLevels(100, 20); // Genera 100 niveles, comenzando con 20 XP para el nivel 1

function calculateLevel(xp) {
    let level = 0;
    for (const lvl of levels) {
        if (xp >= lvl.xpRequired) {
            level = lvl.level;
        } else {
            break;
        }
    }
    return level;
}

module.exports = { levels, calculateLevel };
