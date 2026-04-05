/*
# Curiosity Report: How Linters Work Internally

## Topic
Exploring how JavaScript linters (ESLint) detect code issues and enforce quality rules.

## Motivation
In our course, we’ve used ESLint to catch mistakes and enforce consistent coding style. I realized I didn’t fully understand what ESLint does behind the scenes or why certain rules matter. I wanted to investigate how linters actually analyze code and report violations.

## Experiment Setup
I created a small JavaScript file with deliberate issues:

// Example code that triggers ESLint errors
function unusedFunction() {
    const x = 42;
}

console.log(undeclaredVariable);

// ESLint Output
// C:\Users\Jreed\cs\cs329\examples\eslintExample\curiositea.js
//  1:10  error  'unusedFunction' is defined but never used  no-unused-vars
//  2:11  error  'x' is assigned a value but never used      no-unused-vars
//  5:13  error  'undeclaredVariable' is not defined

// Explanation
// 'unusedFunction' is defined but never used → ESLint detected the function is never called (dead code).
// 'x' is assigned a value but never used → The variable inside the function is never used.
// 'undeclaredVariable' is not defined → You cannot use a variable that hasn’t been declared.

// Fixed Version
function unusedFunction() {
    const x = 42;
    console.log(x); // now 'x' is used
}

unusedFunction(); // now the function is called, so ESLint no longer flags it

const undeclaredVariable = 10;
console.log(undeclaredVariable); // now the variable is declared

## How Linters Work
// 1. ESLint parses the code into an Abstract Syntax Tree (AST), which is a structured representation of the program.
//    Instead of reading raw text, the AST breaks code into elements like variables, functions, and expressions,
//    allowing ESLint to understand how the code is actually organized and used.
//
// 2. ESLint applies a set of rules (such as no-unused-vars and no-undef) by walking through the AST.
//    These rules analyze relationships in the code, like whether a variable is declared but never used,
//    or if something is used without being defined.
//
// 3. When a rule detects a violation, ESLint reports it with details such as the line number,
//    the type of error, and the rule that was broken, often suggesting how to fix it.
//
// This approach allows linters to detect deeper logic-level issues, not just simple formatting mistakes.

## Findings
// - Linters analyze the structure of code rather than raw text, which makes them significantly more powerful
//   than basic formatting tools.
// - They catch errors before the code is ever run, helping prevent runtime crashes and logical bugs.
// - Configurable rules allow teams to enforce consistent coding standards, which is especially important
//   in collaborative environments and DevOps pipelines.
// - Even simple experiments demonstrate that automated tools can catch subtle issues that developers might overlook.

## Reflection
// Understanding ESLint as a static analysis tool helped me see how quality assurance is built directly
// into the development process. Linters are not just for style—they help prevent bugs, enforce consistency,
// and improve long-term maintainability of code.
// This also helped me recognize how tools like linters, compilers, and other analyzers rely on similar concepts
// such as Abstract Syntax Trees and rule-based evaluation to examine code before execution.

## References
// ESLint Documentation: https://eslint.org/docs/latest/
// Abstract Syntax Tree - Wikipedia: https://en.wikipedia.org/wiki/Abstract_syntax_tree
*/