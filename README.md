[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# run the test
❯ node __tests__/__runner.js

# semantics
```ford
// import statement
import (
    "https://github.com/broyeztony/some/ford/module"
)

// variable declaration
let x = "not a number";

// variable initialization, with error handler
let result = square(x) -> {
    // this part here is an error handler
    // It receives the `_` object which describes the error ```{ code: INCOMPATIBLE_TYPE_ERROR, reason: "Incompatible type. Expected: 'Number', Found: 'String'."}```
    // The error handler let us define a 'recover' value. Here, 0 will be assigned to the variable named `result`.
    return 0;
};

// 'if' statements, with 'else' alternative
if x == "not a number" {

}
else {

}

// Functions do not need to declare the argument list
// They receive the `_` object which gives access to all the arguments
def someFunction {
    // the `describe` native function prints out the argument key-value pairs
    describe(_)
}

// calling a function
someFunction({ x: 1, y: 2.5, b: true, s: "hello" }) -> {
    describe(_)
}
```
