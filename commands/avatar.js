const { User, EmbedBuilder } = require('discord.js');

module.exports = {
    description: "Display de la imagen",
    run: async (message) => {
        const target = message.mentions.users.first();
        if (!target) return message.reply('Debes mencionar a un usuario.');

        const member = await message.guild.members.fetch(target.id);
        if (!member) return message.reply('Error obteniendo datos');

        const imagen = member.user.displayAvatarURL({ size: 512 });

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Perfil de <@${member.user.id}>`)
            .setImage(imagen);

        message.reply({ embeds: [embed] });
    }
}
