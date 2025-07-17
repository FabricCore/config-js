let config = module.require("../");
let text = require("text");

function toString(obj) {
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

function flatten(obj, stack, entryName) {
    let keys = Object.keys(obj);
    if (!Array.isArray(obj)) keys.sort();

    let out = [];
    for (let key of keys) {
        if (
            !(obj[key] instanceof java.lang.Object) &&
            typeof obj[key] == "object"
        ) {
            out = out.concat(flatten(obj[key], stack.concat([key]), entryName));
        } else {
            out.push("\n");
            out.push({
                content: stack.concat([key]).join("."),
                color: "#eeeeff",
            });
            out.push({ content: "=", color: "#aaaaaa" });
            let [display, command] = toString(obj[key]);
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
                    suggest: `/config set ${entryName} ${stack.concat([key]).join(".")} ${command} `,
                },
            });
        }
    }

    return out;
}

function openCommand(entryName) {
    let header = text.createText([
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
        text.sendText([header, "\n"].concat(toString(got)[0]));
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
