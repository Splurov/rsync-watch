const chokidar = require('chokidar');
const Rsync = require('rsync');
const debounce = require('debounce');

const CONFIG = require('./config.json');

// For node 4+ support
(function () {
    'use strict';

    const synchronizers = new Map();
    const watchers = [];

    function quit() {
        console.log(`\n[stopping]`);

        for (let entry of synchronizers) {
            let synchronizer = entry[1];
            console.log(`[sync stop] ${synchronizer.project}`);
            synchronizer.process.kill();
        }

        for (let watcher of watchers) {
            console.log(`[watch stop] ${watcher.project}`);
            watcher.watcher.close();
        }

        process.exit();
    };

    process.on('SIGINT', quit); // run signal handler on CTRL-C
    process.on('SIGTERM', quit); // run signal handler on SIGTERM

    function sync(project) {
        const rsync = new Rsync()
            .set('out-format', '%n')
            .set('recursive')
            .set('copy-links')
            .set('perms')
            .set('times')
            .set('delete')
            .set('delete-during')
            .exclude(CONFIG[project].exclude || [])
            .source(CONFIG[project].from)
            .destination(CONFIG[project].to);

        console.log(`[sync start] ${project}`);
        return new Promise((resolve, reject) => {
            const rsyncProcess = rsync.execute((error, code, command) => {
                if (error) {
                    throw error;
                }

                console.log(`[sync finish] ${project} | ${command}`);
                resolve(rsyncProcess.pid);
            }, (data) => {
                process.stdout.write(`[sync] ${data.toString('ascii')}`);
            });

            rsyncProcess.on('close', () => {
                synchronizers.delete(rsyncProcess.pid);
            });

            synchronizers.set(rsyncProcess.pid, {project, process: rsyncProcess});
        });
    }

    function watch(project) {
        const watcher = chokidar.watch(CONFIG[project].from, {
            ignoreInitial: true,
        });
        watchers.push({project, watcher});

        const syncDebounced = debounce(() => {
            sync(project)
                .catch(error => {
                    console.error(`[${project} | sync] `, error);
                });
        }, 500);
        watcher
            .on('ready', function() {
                console.log(`[watch] ${project}`);
            })
            .on('all', function(event, path) {
                console.log(`[watch | ${event}] ${path}`);
                syncDebounced();
            })
            .on('error', function(error) {
                console.error(error);
            });
    }

    for (let project in CONFIG) {
        sync(project).then(function() {
            watch(project);
        }).catch((error) => {
            console.error(`[${project} | sync] `, error);
        });
    }

})();
