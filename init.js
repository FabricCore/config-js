let command = require("command");
let text = require("text");

let config = require("./");

config.save("testing", { one: 1, two: "two", three: { four: 5 } });

command.register({
    name: "config",

    subcommands: {
        open: module.require("./commands/open"),
        set: module.require("./commands/set"),
    },
});
