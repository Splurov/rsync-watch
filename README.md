# Rsync Watch

Node.js app to watch files and directories then sync them to the remote server using rsync.

## Install and use

- Clone repository
- Execute `npm install`
- Copy `config.js.example` to `config.js`
- Edit `config.js`
    - Exclude pattern must be compatible with <https://man.developpez.com/man1/rsync/#L16>
      and <https://github.com/micromatch/micromatch#matching-features> at the same time
- Execute `npm run sync` to start sync and watch

## Changelog

### 4.0.3

- Add an option to show desktop notification on error and on sync end. Credits to [@neroze](https://github.com/neroze)

### 4.0.2

- Update dependencies due to kind-of security warnings

### 4.0.1

- Update dependencies due to security warnings

### 4.0.0

- Configuration file moved from config.json to config.js

### 3.0.1

- Stop script execution on initial sync error

### 3.0.0

- \[Breaking\] Exclude config also applied to watcher (before only for rsync).
  Pattern must be compatible with <https://man.developpez.com/man1/rsync/#L16>
  and <https://github.com/micromatch/micromatch#matching-features> at the same time

### 2.0.1

- Update dependencies to latest versions

### 2.0.0

- rsync configuration moved from code to config.json as `rsyncOptions` property.
