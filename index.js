require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('🟢 The bot is online!');
  client.user.setActivity('WITH YOUR 🧠');
});

const configuration = new Configuration({
  apiKey: "OPEN-API_KEY",
});

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== "CHANNEL_ID") return;
  if (message.content.startsWith('!')) return;

  try {
    const typingMessage = await message.channel.send(`${message.author} <a:q_loadingg:1118877722274443384> generating a response, please wait...`);

    // Sending typing status
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 5 });
    prevMessages.reverse();

    let conversationLog = [
      { role: 'system', content: 'You are a friendly chatbot.' },
    ];

    prevMessages.forEach((msg) => {
      if (message.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const result = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: conversationLog,
    });

    typingMessage.delete(); // Remove the typing message

    const reply = result.data.choices[0].message.content;

    // Mention and reply to the user
    const chunkSize = 1999;
    for (let i = 0; i < reply.length; i += chunkSize) {
      const chunk = reply.substring(i, i + chunkSize);
      await message.reply(chunk);
    }
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login('BOT_TOKEN');
