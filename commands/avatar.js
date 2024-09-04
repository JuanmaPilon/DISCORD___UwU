module.exports = {
    data: {
        name: 'avatar',
        description: 'Muestra el avatar de un usuario',
        options: [
            {
                name: 'usuario',
                description: 'El usuario cuyo avatar quieres ver',
                type: 6,  // 6 es tipo opcion para usuarios
                required: false  // si no se le pasa argumentos tira la propia
            }
        ]
    },
    async execute(interaction) {
        // get el usuario
        const user = interaction.options.getUser('usuario') || interaction.user;

        const avatarURL = user.displayAvatarURL({ size: 512, dynamic: true }); // dynamic true permite avatares animados

        await interaction.reply({
            content: `Avatar de ${user.username}: ${avatarURL}`,
            ephemeral: false
        });
    }
};
