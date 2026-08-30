#!/usr/bin/env node
/* CLI to manage API keys stored in keys.json (used by server.js).
 *
 * Usage:
 *   node scripts/manage-keys.js generate [--name "My Bot"]   create a key
 *   node scripts/manage-keys.js list                         show all keys (id, name, created)
 *   node scripts/manage-keys.js revoke <key>                 revoke a key
 *   node scripts/manage-keys.js <key>                        lookup a single key
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEYS_FILE = path.join(__dirname, '..', 'keys.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  } catch (e) {
    return { keys: [] };
  }
}

function save(data) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function generateKey() {
  return crypto.randomBytes(24).toString('hex');
}

function main() {
  const [cmd, arg] = process.argv.slice(2);
  const data = load();

  if (cmd === 'generate') {
    const nameIdx = process.argv.indexOf('--name');
    const name = nameIdx !== -1 ? process.argv[nameIdx + 1] : '';
    const key = generateKey();
    data.keys.push({
      key,
      name: name || null,
      created: new Date().toISOString(),
      revoked: false,
    });
    save(data);
    console.log(key);
    console.error(`Key created${name ? ` for "${name}"` : ''}. Store it somewhere safe - it is shown only once.`);
    return;
  }

  if (cmd === 'list') {
    if (data.keys.length === 0) {
      console.log('No keys yet. Run: node scripts/manage-keys.js generate');
      return;
    }
    for (const entry of data.keys) {
      const state = entry.revoked ? 'REVOKED' : 'active';
      console.log(`${state}\t${entry.key}\t${entry.name || ''}\t${entry.created}`);
    }
    return;
  }

  if (cmd === 'revoke') {
    if (!arg) { console.error('usage: node scripts/manage-keys.js revoke <key>'); process.exit(1); }
    const entry = data.keys.find((k) => k.key === arg);
    if (!entry) { console.error('Key not found.'); process.exit(1); }
    entry.revoked = true;
    save(data);
    console.log(`Revoked key ${arg}`);
    return;
  }

  if (cmd) {
    const entry = data.keys.find((k) => k.key === cmd && !k.revoked);
    if (!entry) { console.error('Key not found or revoked.'); process.exit(1); }
    console.log(JSON.stringify(entry, null, 2));
    return;
  }

  console.log('Usage: node scripts/manage-keys.js <generate|list|revoke|lookup>');
  process.exit(1);
}

main();
