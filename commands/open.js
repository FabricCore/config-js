let config = module.require("../");
let text = require("text");

function valueToCommand(obj) {
    if (obj instanceof java.lang.Object) return "expression";
    switch (typeof obj) {
        case "string":
            return "string";
        case "number":
        case "bigint":
            return "number";
        case "boolean":
            return "boolean";
        default:
            return "expression";
    }
}

function valToString(obj) {
    if (obj instanceof java.lang.Object) {
        return [
            {
                content: `(Java) ${obj}`,
                color: "#dd2277",
            },
            "expression",
        ];
    }

    switch (typeof obj) {
        case "string":
            return [
                {
                    content: `'${obj}'`,
                    color: "#77dd77",
                },
                "string",
            ];
        case "number":
        case "bigint":
            return [
                {
                    content: obj.toString(),
                    color: "#dddd44",
                },
                "number",
            ];
        case "boolean":
            return [
                {
                    content: obj.toString(),
                    color: "#dddd44",
                },
                "boolean",
            ];
        default:
            return [
                {
                    content: `${obj}`,
                    color: "#ee4499",
                },
                "expression",
            ];
    }
}

function flatten(obj, stack, entryName, isArray = false) {
    let keys = Object.keys(obj);
    if (!Array.isArray(obj)) keys.sort();

    let out = [];
    for (let key of keys) {
        if (
            !(obj[key] instanceof java.lang.Object) &&
            typeof obj[key] == "object"
        ) {
            if (Array.isArray(obj[key])) {
                let itemTypes = obj[key].map(valueToCommand);
                let command =
                    itemTypes.length != 0 &&
                    itemTypes.every((t) => t == itemTypes[0])
                        ? itemTypes[0]
                        : "expression";

                out = out.concat([
                    "\n",
                    {
                        content: `${stack.join(".")}${stack.length == 0 ? "" : "."}`,
                        color: "#ccccdd",
                    },
                    {
                        content: key,
                        color: "#eeeeff",
                    },
                    " ",
                    {
                        content: "[+]",
                        color: "#888888",
                        hover: [
                            "Add an item to array ",
                            {
                                content: stack.concat([key]).join("."),
                                italic: true,
                            },
                        ],
                        click: {
                            suggest: `/config set ${entryName} ${stack.concat([key]).concat([obj[key].length.toString()]).join(".")} ${command} `,
                        },
                    },
                ]);
                out = out.concat(
                    flatten(obj[key], stack.concat([key]), entryName, true),
                );
            } else {
                out = out.concat(
                    flatten(obj[key], stack.concat([key]), entryName),
                );
            }
        } else {
            out.push("\n");
            out.push({
                content: `${stack.join(".")}${stack.length == 0 ? "" : "."}`,
                color: "#ccccdd",
            });
            out.push({
                content: key,
                color: "#eeeeff",
            });
            out.push({
                content: "=",
                color: "#776666",
            });
            let [display, command] = valToString(obj[key]);
            out.push(display);
            out.push(" ");
            out.push({
                content: "[E]",
                color: "#888888",
                hover: [
                    "Edit value of ",
                    { content: stack.concat([key]).join("."), italic: true },
                ],
                click: {
                    suggest: `/config set ${entryName} ${stack.concat([key]).join(".")} ${command} ${obj[key]}`,
                },
            });
            if (isArray) {
                out.push(" ");
                out.push({
                    content: "[-]",
                    color: "#888888",
                    hover: [
                        "Remove ",
                        {
                            content: stack.concat([key]).join("."),
                            italic: true,
                        },
                    ],
                    click: `/config unset ${entryName} ${stack.concat([key]).join(".")}`,
                });
            }
        }
    }

    return out;
}

function openCommand(entryName) {
    let header = text.createText([
        {
            content: "[<]",
            hover: "Back to all configs",
            click: "/config",
            color: "#888888",
        },
        " ",
        {
            content: "[",
            color: "#999933",
        },
        {
            content: `Contents of ${entryName}`,
            color: "#ffbb55",
        },
        {
            content: "]",
            color: "#999933",
        },
    ]);

    let got = config.load(entryName);

    if (got == undefined || got == null || Object.keys(got).length == 0) {
        text.sendText([
            header,
            "\n",
            {
                content: "This config is empty.",
                italic: true,
                color: "#888888",
            },
        ]);
    } else if (!(got instanceof java.lang.Object) && typeof got == "object") {
        text.sendText([header].concat(flatten(got, [], entryName)));
    } else {
        text.sendText([header, "\n"].concat(valToString(got[0])));
    }
}

module.exports = {
    args: {
        entry: {
            type: "greedy",
            suggests: config.entries,
            execute: openCommand,
        },
    },
};
