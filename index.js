let fs = require("fs");

let cache = {};

function load(name) {
    if (cache[name]) return cache[name];

    if (fs.existsSync(`storage/config/${name}.json`)) {
        let got = require(`/storage/config/${name}.json`);
        cache[name] = got;
        if (got != undefined) return got;
    } else {
        delete cache[name];
    }
}

function remove(name) {
    delete cache[name];

    if (fs.existsSync(`storage/config/${name}.json`)) {
        fs.unlinkSync(`storage/config/${name}.json`);
    }
}

function forceWrite(name) {
    if (cache[name] == undefined) {
        if (fs.existsSync(`storage/config/${name}.json`)) {
            fs.unlinkSync(`storage/config/${name}.json`);
        }
    } else {
        fs.mkdirSync(`storage/config/${name.split("/").slice(0, -1)}`);
        fs.writeFileSync(
            `storage/config/${name}.json`,
            JSON.stringify(cache[name], null, 2),
        );
    }
}

function save(name, value, write) {
    if (value == undefined) {
        remove(name);
        return;
    }

    cache[name] = value;

    if (write) forceWrite(name);
}

function forceWriteAll() {
    for (let name in cache) {
        forceWrite(name);
    }
}

let allLoaded = false;

function loadRecursive(path = []) {
    for (let entry of fs.readdirSync(`storage/config/${path.join("/")}`)) {
        if (entry.endsWith(".json")) {
            let name = `${path.concat([entry.slice(0, -5)]).join("/")}`;
            load(name);
        } else {
            loadRecursive(path.concat([entry]));
        }
    }
}

function loadAll() {
    if (!allLoaded && fs.isDirSync("storage/config")) {
        loadRecursive();
        allLoaded = true;
    }
}

function entries() {
    loadAll();
    return Object.keys(cache);
}

module.exports = {
    load,
    remove,
    forceWrite,
    forceWriteAll,
    save,
    entries,
};
