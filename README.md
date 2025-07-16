Config files are only read once and cached, and writes to disk only when game quits (or jsc restarts) so its like blazingly fast.

```
let config = require("config");

// default is undefined if not present
let options = config.load("full/name/separated/by/slashes");

// if options does not exist, set its value to a default value
options ??= { defaultValue: 1 };

options.message = { hello: "world" };

// saves a value: does not actually write to disk until game quits
config.save("full/name/separated/by/slashes", options);
```
