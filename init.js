let command = require("command");
let text = require("text");

let config = require("./");
let list = require("./commands/list");

config.save("testing", { one: 1, two: "two", three: { four: 5 } });

command.register({
    name: "config",

    execute: list.list,

    subcommands: {
        open: module.require("./commands/open"),
        set: module.require("./commands/set"),
        unset: module.require("./commands/unset"),
    },
});
