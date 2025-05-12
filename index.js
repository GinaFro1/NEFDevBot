const { Client } = require("discord.js-selfbot");
const express = require("express");
require("dotenv").config();

const app = express();
const port = 3000;

const client = new Client();

// Keep track of the last embed message
let lastEmbed = null;

// Listen for new messages (from your Discord client as a selfbot)
client.on("message", (msg) => {
  // Check if the message contains an embed (and is from a bot)
  if (msg.author.bot && msg.embeds.length > 0) {
    lastEmbed = msg.embeds[0]; // Store the embed
  }
  if (!msg.author.bot && msg.content.startsWith("!checkBot")) {
    msg.reply("I am working and online!");
  }
});

// Endpoint to get the net worth of a player
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

  // Validate that embed is found *and* matches the player
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

// Login using the user's token
client.login(process.env.TOKEN);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
