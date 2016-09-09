const chokidar = require('chokidar');
const Rsync = require('rsync');
const debounce = require('debounce');

const CONFIG = require('./config.json');

let synchronizers = [];
let watchers = [];

let quit = function() {
    console.log(`\n[stopping]`);

    for (let synchronizer of synchronizers) {
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
    let rsync = new Rsync()
        .set('out-format', '%n')
        .set('recursive')
        .set('copy-links')
        .set('perms')
        .set('times')
        .set('delete')
        .set('delete-during')
        .exclude('*.pyc')
        .source(CONFIG[project].from)
        .destination(CONFIG[project].to);

    console.log(`[sync start] ${project}`);
    return new Promise(function(resolve, reject) {
        let rsyncProcess = rsync.execute(function(error, code, command) {
            if (error) {
                reject(error);
                return;
            }

            console.log(`[sync finish] ${project} | ${command}`);
            resolve();
        }, function(data) {
            process.stdout.write(`[sync] ${data.toString('ascii')}`);
        });
        synchronizers.push({project, process: rsyncProcess});
    });
}

function watch(project) {
    let watcher = chokidar.watch(CONFIG[project].from, {
        ignoreInitial: true,
    });
    watchers.push({project, watcher});

    let syncDebounced = debounce(sync.bind(null, project), 500);
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
    }).catch(function(error) {
        console.error(error);
    });
}