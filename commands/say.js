module.exports = {
    description:  'Argumento',
    run: async (message) => {
        const args = message.content.split(' ').slice(1).join(' ');
        if (args.length < 1) return message.reply(`No argumento valido`);
        message.reply(args);
    }
}