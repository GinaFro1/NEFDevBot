const { Client, GatewayIntentBits,EmbedBuilder } = require('discord.js');
const express = require("express");
require("dotenv").config();

const app = express();
const port = 3000;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

let lastEmbed = null;

client.on("messageCreate", (msg) => {
  if (!msg.author.bot && msg.content == "nef!botstatus"){
    const embed = new EmbedBuilder().setTitle("Bot Status").setDescription("Espress Server: Online\nBot : Online")
   msg.reply({ embeds: [embed] });
  }
  if (msg.author.bot && msg.embeds.length > 0) {
    lastEmbed = msg.embeds[0]; 
  }
  
});

app.get("/networth", async (req, res) => {
  const player = req.query.player;
  if (!player) return res.status(400).send("Missing player parameter");

  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  if (!channel) return res.status(404).send("Channel not found");

  await channel.send(`nefonly!networth ${player}`);

  for (let i = 0; i < 10; i++) {
    if (
      lastEmbed &&
      lastEmbed.title &&
      lastEmbed.title.toLowerCase().includes(player.toLowerCase())
    ) {
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (
    !lastEmbed ||
    !lastEmbed.title ||
    !lastEmbed.title.toLowerCase().includes(player.toLowerCase())
  ) {
    return res.status(404).json({ error: "No matching embed response found" });
  }

  const data = {
    title: lastEmbed.title,
    description: lastEmbed.description,
    fields: (lastEmbed.fields || []).map((f) => ({
      name: f.name.replace(/:[^:\s]+:/g, "").trim(),
      value: f.value.replace(/\\n/g, "\n").trim(),
    })),
  };

  lastEmbed = null;

  res.json(data);
});

client.login(process.env.TOKEN);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
