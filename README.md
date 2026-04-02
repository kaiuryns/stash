# stash

A self-hosted shared list that syncs in real time across devices on the same Wi-Fi network. Runs on Termux (Android) — no cloud, no accounts, no setup beyond your own phone.

## Running
```bash
gem install bundler
bundle install
bundle exec ruby server.rb
```

The terminal prints the IP and a QR code. Scan it or type the address in any browser on the same network.

## How concurrency works

Every write carries a `client_timestamp`. The server only applies the operation if that timestamp is newer than the last recorded update — old decisions don't overwrite new data.
```
client_timestamp >= updated_at  →  accepted
client_timestamp <  updated_at  →  conflict, returns current state
```

This means a DELETE decided before a PUT won't delete the item after it was updated.

## Stack

- **Sinatra** — HTTP server
- **SQLite + Sequel** — local database
- **Faye WebSocket** — real-time sync
- **Vanilla JS** — web client, no frameworks
