[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

```ford
.----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. |
| |              | || |     ___      | || |     __       | |
| |              | || |    |_  |     | || |    \_ `.     | |
| |              | || |      | |     | || |      | |     | |
| |              | || |      | |     | || |       > >    | |
| |              | || |     _| |     | || |     _| |     | |
| |   _______    | || |    |___|     | || |    /__.'     | |
| |  |_______|   | || |              | || |              | |
| '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'
```

# Run the unit-tests
```shell
❯ ./test
```


# Print the AST for a program
```shell
❯ ./run <path-to-program>
```

# Example
```
❯ ./run ./samples/error.handler.ford
```

```ford
 .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. |
| |              | || |     ___      | || |     __       | |
| |              | || |    |_  |     | || |    \_ `.     | |
| |              | || |      | |     | || |      | |     | |
| |              | || |      | |     | || |       > >    | |
| |              | || |     _| |     | || |     _| |     | |
| |   _______    | || |    |___|     | || |    /__.'     | |
| |  |_______|   | || |              | || |              | |
| '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------' 

{
  "type": "Program",
  "body": [
    {
      "type": "VariableStatement",
      "declarations": [
        {
          "type": "VariableDeclaration",
          "id": {
            "type": "Identifier",
            "name": "a"
          },
          "initializer": {
            "type": "StringLiteral",
            "value": "not a number"
          }
        }
      ]
    },
    {
      "type": "FunctionDeclaration",
      "name": {
        "type": "Identifier",
        "name": "square"
      },
      "body": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ReturnStatement",
            "argument": {
              "type": "BinaryExpression",
              "operator": "*",
              "left": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "_"
                },
                "property": {
                  "type": "Identifier",
                  "name": "x"
                }
              },
              "right": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "_"
                },
                "property": {
                  "type": "Identifier",
                  "name": "x"
                }
              }
            }
          }
        ]
      }
    },
    {
      "type": "VariableStatement",
      "declarations": [
        {
          "type": "VariableDeclaration",
          "id": {
            "type": "Identifier",
            "name": "result"
          },
          "initializer": {
            "type": "CallExpression",
            "callee": {
              "type": "Identifier",
              "name": "square"
            },
            "arguments": [
              {
                "type": "Identifier",
                "name": "x"
              }
            ]
          },
          "errorHandler": {
            "type": "BlockStatement",
            "body": [
              {
                "type": "ReturnStatement",
                "argument": {
                  "type": "NumericLiteral",
                  "value": 0
                }
              }
            ]
          }
        }
      ]
    },
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "Identifier",
          "name": "square"
        },
        "arguments": [
          {
            "type": "ObjectLiteral",
            "values": [
              {
                "name": "x",
                "value": 10
              }
            ]
          }
        ]
      }
    },
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "Identifier",
          "name": "print"
        },
        "arguments": [
          {
            "type": "Identifier",
            "name": "result"
          }
        ]
      }
    }
  ]
}
```

# Semantics
```ford
// import statement
import (
    "https://github.com/broyeztony/some/ford/module",
    "https://github.com/broyeztony/some/other/ford/module"
)

// variable declaration
let x = "not a number";

// Functions do not need to declare the argument list
// They receive the `_` object which gives access to all the arguments
def square {
    // describe is a native function that outputs a map of key-value pairs of the caller arguments
    describe(_)

    return _.x * _.x;
}

// variable initialization, with optional error handler following the error handler operator `->`
let result = square({ x: x }) -> {
    // This part here is an optional error handler.
    // It receives the `_` object which is an error object:
    // In this case ```{ code: INCOMPATIBLE_TYPE_ERROR, reason: "Incompatible type. Expected: 'Number', Found: 'String'."}```
    // The error handler let us return a 'recovery' value. Here, 0 will be assigned to the variable named `result`.
    // The error handler is not required to return a value.
    recover 0;
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

// function definition with explicit arguments declaration
def increment (x) {
    while (x < 10) {
        x = x + 1;
    }
    return x;
}

// calling a function, with error handler
result  = increment(0) -> {
    // describe the error object
    describe(_);
};

// Function's arguments can also be passed as a list like in the example below.
// In that case, they need to be accessed by index from the `_` implicit object.
def someOtherFunction {
    print(_[0]);
    print(_[1]);
}

someOtherFunction(1, 2);
```
