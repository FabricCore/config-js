let config = module.require("../");
let previous = module.require("./previous");
let text = require("text");

function list() {
    previous(
        text.sendText(
            [
                {
                    content: "[",
                    color: "#999933",
                },
                {
                    content: `List of All Configs`,
                    color: "#ffbb55",
                },
                {
                    content: "]",
                    color: "#999933",
                },
            ].concat(
                config
                    .entries()
                    .sort()
                    .flatMap((entry) => [
                        "\n",
                        {
                            content: "[>]",
                            hover: [
                                "Open ",
                                {
                                    content: entry,
                                    italic: true,
                                },
                            ],
                            click: `/config open ${entry}`,
                            color: "#888888",
                        },
                        " ",
                        {
                            content: entry,
                            color: "#aaaaaa",
                        },
                    ]),
            ),
        ),
    );
}

module.exports = {
    list,
};
