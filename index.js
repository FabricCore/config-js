let fs = require("fs");

let cache = {};

function load(name) {
    if (cache[name]) return cache[name];

    if (fs.existsSync(`storage/config/${name}.json`)) {
        return require(`/storage/config/${name}.json`);
    } else {
        cache[name] = undefined;
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
    cache[name] = value;

    if (write) forceWrite(name);
}

function forceWriteAll() {
    for (let name in cache) {
        forceWrite(name);
    }
}

module.exports = {
    load,
    remove,
    forceWrite,
    forceWriteAll,
    save,
};
