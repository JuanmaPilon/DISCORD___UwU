module.exports = {
    data: {
        name: 'say',
        description: 'Repite lo que dices',
        options: [
            {
                name: 'mensaje',
                description: 'El mensaje que quieres que repita el bot',
                type: 3,  // 3 es el tipo para cadenas de texto
                required: true
            }
        ]
    },
    async execute(interaction) {
        const message = interaction.options.getString('mensaje');
        await interaction.reply(message);
    }
};
