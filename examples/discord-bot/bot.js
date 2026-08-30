#!/usr/bin/env node
/* Badgeworks Discord bot example.
 *
 * A minimal discord.js bot that exposes a `/badge` slash command.
 * It calls the Badgeworks API to generate a badge, then replies with the
 * PNG attachment and the SVG source in a code block.
 *
 * Configuration (env vars):
 *   DISCORD_TOKEN   - bot token
 *   API_URL         - Badgeworks API base URL (e.g. http://localhost:8080)
 *   API_KEY         - API key for the Badgeworks server
 *
 * Install: npm install discord.js
 * Run:     DISCORD_TOKEN=abc API_URL=http://localhost:8080 API_KEY=xxx node bot.js
 */
'use strict';

const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;

if (!TOKEN || !API_KEY) {
  console.error('Missing DISCORD_TOKEN or API_KEY environment variable.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'badge') return;

  await interaction.deferReply();

  const topText = interaction.options.getString('top') || 'Available on';
  const bottomText = interaction.options.getString('bottom') || 'Badge';
  const style = interaction.options.getString('style') || 'cozy';
  const preset = interaction.options.getString('preset') || 'github';
  const logoPosition = interaction.options.getString('logo-position') || 'left';
  const showDisk = interaction.options.getBoolean('show-disk') || false;

  // Build query params
  const params = new URLSearchParams({
    topText, bottomText, style, presetKey: preset,
    logoPosition, showDisk: String(showDisk),
  });

  try {
    const res = await fetch(`${API_URL}/api/badge?${params}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!res.ok) {
      const text = await res.text();
      await interaction.editReply(`API error ${res.status}: ${text}`);
      return;
    }

    const data = await res.json();

    // Decode base64 PNG to buffer
    const pngBuffer = Buffer.from(data.png, 'base64');
    const svgCodeBlock = '```svg\n' + data.svg + '\n```';

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`${bottomText} badge`)
      .setDescription(`Style: ${style} | ${data.width}×${data.height}`)
      .setImage('attachment://badge.png');

    await interaction.editReply({
      embeds: [embed],
      files: [{
        attachment: pngBuffer,
        name: 'badge.png',
      }],
    });
  } catch (err) {
    await interaction.editReply(`Error: ${err.message}`);
  }
});

// Register slash command
client.once('ready', async () => {
  const command = new SlashCommandBuilder()
    .setName('badge')
    .setDescription('Generate a Devin Badge')
    .addStringOption(o => o.setName('bottom').setDescription('Bottom text (e.g. GitHub)').setRequired(true))
    .addStringOption(o => o.setName('top').setDescription('Top text (e.g. Available on)'))
    .addStringOption(o => o.setName('style').setDescription('Badge style').addChoices(
      { name: 'Cozy', value: 'cozy' },
      { name: 'Compact', value: 'compact' },
      { name: 'Cozy Minimal', value: 'cozy-minimal' },
      { name: 'Compact Minimal', value: 'compact-minimal' },
    ))
    .addStringOption(o => o.setName('preset').setDescription('Preset icon').addChoices(
      ...Object.keys(require('../badge-core.js').OFFICIAL_BRAND_ICONS).map(k => ({ name: k, value: k })),
    ))
    .addStringOption(o => o.setName('logo-position').setDescription('Logo position').addChoices(
      { name: 'Left', value: 'left' },
      { name: 'Right', value: 'right' },
      { name: 'None', value: 'none' },
    ))
    .addBooleanOption(o => o.setName('show-disk').setDescription('Show background disk'));

  try {
    const guilds = await client.guilds.fetch();
    for (const [id] of guilds) {
      const guild = await client.guilds.fetch(id);
      await guild.commands.create(command);
    }
    console.log('Slash command registered.');
  } catch (e) {
    console.warn('Could not register commands:', e.message);
  }
});

client.login(TOKEN);