const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        console.error("Error al abrir la base de datos", err.message);
    } else {
        // crea la tabla 'settings' si no existe
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`, (err) => {
            if (err) {
                console.error("Error al crear la tabla settings:", err.message);
            }
        });
    }
});

module.exports = {
    data: {
        name: 'setlevelchannel',
        description: 'Selecciona el canal donde se enviarán las actualizaciones de nivel',
        options: [
            {
                name: 'canal',
                description: 'Selecciona un canal de texto',
                type: 7,  // tipo 7 es para canal
                required: true
            }
        ]
    },
    async execute(interaction) {
        try {
            // obtiene el canal seleccionado
            const channel = interaction.options.getChannel('canal');

            // verifica que es canal de texto
            if (!channel || channel.type !== 0) {  // 0 es para canales de texto
                return interaction.reply({ content: 'Por favor selecciona un canal de texto válido.', ephemeral: true });
            }

            // guarda el canal en la bd
            db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('level_channel', ?)", [channel.id], (err) => {
                if (err) {
                    console.error("Error al guardar el canal en la base de datos:", err.message);
                    return interaction.reply({ content: 'Hubo un error al intentar guardar el canal.', ephemeral: true });
                }

               // response tod ok
                interaction.reply(`¡Canal seleccionado para actualizaciones de nivel: ${channel.name}!`);
            });
        } catch (error) {
            console.error('Error al ejecutar el comando setlevelchannel:', error);
            interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
        }
    }
};
