let config = module.require("../");
let open = module.require("./open");

function unset(obj, path) {
    if (path.length == 1) {
        if (Array.isArray(obj)) obj.splice(path[0], 1);
        else delete obj[path[0]];
    } else if (!(obj instanceof java.lang.Object) && typeof obj == "object") {
        obj[path[0]] ??= {};
        unset(obj[path[0]], path.slice(1));
    } else {
        console.error(`Cannot unset value in ${obj}`);
    }
}

function unsetAny(entry, field) {
    let path = field.split(".");
    let got = config.load(entry) ?? {};

    unset(got, path);
    config.save(entry, got);
    open.args.entry.execute(entry);
}

function walkFields(obj, stack) {
    if (obj instanceof java.lang.Object || typeof obj != "object")
        return [stack.join(".")];

    return Object.entries(obj).flatMap(([k, v]) =>
        walkFields(v, stack.concat(k)),
    );
}

function suggestsFields(entry) {
    return walkFields(config.load(entry), []);
}

module.exports = {
    args: {
        entry: {
            type: "string",
            suggests: () => config.entries(),
            args: {
                field: {
                    type: "string",
                    suggests: suggestsFields,
                    execute: unsetAny,
                },
            },
        },
    },
};
