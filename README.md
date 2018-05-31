# Rsync Watch

Node.js app to watch files and directories then sync them to the remote server using rsync.

## Install and use

- Clone repository
- Execute `npm install`
- Copy `config.json.example` to `config.json`
- Edit `config.json`
- Execute `npm run sync` to start sync and watch

## Changelog

### 2.0.1

- Update dependencies to latest versions

### 2.0.0

- rsync configuration moved from code to config.json as `rsyncOptions` property.
