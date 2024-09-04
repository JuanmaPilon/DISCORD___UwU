module.exports = {
    data: {
        name: 'givexp',
        description: 'Otorga XP a un usuario especificado',
        options: [
            {
                name: 'usuario',
                description: 'Usuario al que se le otorgará XP',
                type: 6,  // 6 es el tipo para usuarios
                required: true
            },
            {
                name: 'cantidad',
                description: 'Cantidad de XP a otorgar',
                type: 4,  // 4 es el tipo para enteros
                required: true
            }
        ]
    },
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const xpAmount = interaction.options.getInteger('cantidad');

        // logica para dar xp
        await interaction.reply(`Se han otorgado ${xpAmount} XP a ${user.tag}.`);
    }
};
