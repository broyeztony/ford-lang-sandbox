[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# run the tests
❯ node __tests__/__runner.js

# language semantics
```ford
// import statement
import (
    "https://github.com/broyeztony/some/ford/module"
)

// variable declaration
let x = "not a number";

// Functions do not need to declare the argument list
// They receive the `_` object which gives access to all the arguments
def square {
    return _.x * _.x;
}

// variable initialization, with optional error handler following the error handler operator `->`
let result = square(x) -> {
    // This part here is an optional error handler.
    // It receives the `_` object which is an error object:
    // In this case ```{ code: INCOMPATIBLE_TYPE_ERROR, reason: "Incompatible type. Expected: 'Number', Found: 'String'."}```
    // The error handler let us return a 'recovery' value. Here, 0 will be assigned to the variable named `result`.
    // The error handler is not required to return a value.
    return 0;
};

// 'if' statements, with 'else' alternative
if result > 1 {
    
}
else {
    
}

// ObjectLiteral assignment
let A = { x: 1, y: 2, b: true, s: "hello" };

// Empty BlockStatement
{}

// Functions do not need to declare the argument list
// They receive the `_` object which gives access to all the arguments
def someFunction {
    // describe the arguments object
    describe(_);

    while (_.x < 10) {
        _.x = _.x + 1;
    }
}

// calling a function, with error handler
someFunction({ x: 1, y: 2, b: true, s: "hello" }) -> {
    // describe the error object
    describe(_);
};
```
