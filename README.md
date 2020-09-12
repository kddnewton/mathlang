# mathlang

A small language I'm writing to learn more about compilers/interpreters/virtual machines/optimizers/type checkers/etc. without using dependencies.

## Syntax

### Basics

Each line is considered its own statement, and can be:

- a mathematical expression
- a function definition
- a local variable assignment

### Expressions

Expressions looks like you would normally express math on paper. Here are some examples:

- `1 + 2 + 3`
- `2 - 3 - 4`
- `3 * 4 * 5`
- `4 / 5 / 6`
- `7^8`
- `(1 + 2) * 3`

### Functions

Functions are local to whatever context you're currently in (top-level or another function). They become defined wherever you define them and are not hoisted (so you can only call them after you've declared them, there are no forward-declarations). They suppose implicit returns, so whatever the final expression in your function body will be what is returned. Here is an example:

```
f(x) = x * 3
```

You would then be able to call that function with:

```
f(x)
```

#### Built-in

A couple of functions comes built-in to the runtime. Those include:

- `add(x, y)` - add two numbers
- `div(x, y)` - divide two numbers
- `exp(x, p)` - raise a number to a power
- `ln(x)` - get the natural log of a number
- `log(x)` - get the base10 log of a number
- `mul(x, y)` - multiply two numbers
- `neg(x)` - negate a number
- `sqrt(x)` - get the square root of a number
- `sub(x, y)` - subtract two numbers

### Local

There is support for local variables either at the top-level or inside a function. Local variables are only scoped to their current context and are not inherited by inner functions. They are untyped, as the only type at the moment is a number. Here are examples of setting and using local variables:

```
a = 5
f(a * 5)
```

## Running

For now you can run `bin/math.ts [path/to/file]` or you can pipe a script into it, as in `echo "1 + 2" | bin/math.ts`.
