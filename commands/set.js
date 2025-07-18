let config = module.require("../");
let open = module.require("./open");
let { StringArgumentType } = com.mojang.brigadier.arguments;

function set(obj, path, content) {
    if (path.length == 1) {
        obj[path] = content;
    } else if (!(obj instanceof java.lang.Object) && typeof obj == "object") {
        obj[path[0]] ??= {};
        set(obj[path[0]], path.slice(1), content);
    } else {
        console.error(`Cannot set value in ${obj}`);
    }
}

function setAny(entry, field, content) {
    let path = field.split(".");
    let got = config.load(entry) ?? {};

    set(got, path, content);
    config.save(entry, got);
    open.args.entry.execute(entry);
}

function setExpr(entry, field, expr) {
    let content = eval(expr);
    setAny(entry, field, content);
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
                    subcommands: {
                        string: {
                            args: {
                                content: {
                                    type: "greedy",
                                    execute: setAny,
                                },
                            },
                        },
                        number: {
                            args: {
                                content: {
                                    type: "double",
                                    execute: setAny,
                                },
                            },
                        },
                        boolean: {
                            args: {
                                content: {
                                    type: "bool",
                                    execute: setAny,
                                },
                            },
                        },
                        expression: {
                            args: {
                                content: {
                                    type: "greedy",
                                    execute: setExpr,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
