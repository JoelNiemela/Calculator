<h1 align="center">Calculator</h1>

<p align="center" style="font-weight: bold;">An advanced calculator app written in JavaScript</p>
<p align="center">
  <img alt="Calculator" src="docs/Calculator.png" width="50%">
</p>

## Live Example
[JoelNiemela.github.io/Calculator](https://JoelNiemela.github.io/Calculator)

## Features

### Variables
Supports assigning custom variables:
```ruby
x : 40
y : 2
x + y
42
```

### Lambdas
Define and reuse your own custom lambda functions:
```ruby
fn : λx.x+2
fn(5)
7
```

Or use lambda literals directly (IIFE):
```ruby
(λx.x+2)(3)
5
```

### Unicode support
```ruby
√(π)
1.7724538509055743
```

### Predefined mathematical constants
```ruby
e : 2.71828182846
π : 3.14159265359
```

### Predefined functions
```ruby
sin
cos
tan
ln
log
sqrt
cbrt
```
#### Unicode aliases
```ruby
√ : sqrt
∛ : cbrt
```

### Operators
```ruby
x + y
x - y
x × y
x ÷ y
x ^ y
```
