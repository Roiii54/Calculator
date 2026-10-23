const resultDisplay = document.querySelector(".result");
const buttons = document.querySelector(".buttons");

let expression = "";
let showingResult = false;

function formatResult(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Result is outside the supported range");
  }

  if (Object.is(value, -0)) {
    return "0";
  }

  return String(Number(value.toPrecision(12)));
}

function evaluateExpression(input) {
  let position = 0;

  function parseNumber() {
    const match = input.slice(position).match(/^(?:\d+\.?\d*|\.\d+)/);
    if (!match) {
      throw new Error("Expected a number");
    }

    position += match[0].length;
    return Number(match[0]);
  }

  function parseUnary() {
    if (input[position] === "+") {
      position += 1;
      return parseUnary();
    }
    if (input[position] === "-") {
      position += 1;
      return -parseUnary();
    }
    return parseNumber();
  }

  function parseTerm() {
    let value = parseUnary();

    while (input[position] === "*" || input[position] === "/") {
      const operator = input[position];
      position += 1;
      const nextValue = parseUnary();

      if (operator === "/" && nextValue === 0) {
        throw new Error("Cannot divide by zero");
      }
      value = operator === "*" ? value * nextValue : value / nextValue;
    }

    return value;
  }

  function parseSum() {
    let value = parseTerm();

    while (input[position] === "+" || input[position] === "-") {
      const operator = input[position];
      position += 1;
      const nextValue = parseTerm();
      value = operator === "+" ? value + nextValue : value - nextValue;
    }

    return value;
  }

  const value = parseSum();
  if (position !== input.length) {
    throw new Error("Invalid expression");
  }
  return value;
}

function renderExpression() {
  resultDisplay.textContent = expression || "0";
}

function appendDigit(digit) {
  if (showingResult) {
    expression = "";
    showingResult = false;
  }

  expression += digit;
  renderExpression();
}

function appendDecimal() {
  if (showingResult) {
    expression = "";
    showingResult = false;
  }

  const currentNumber = expression.split(/[+\-*\/]/).at(-1);
  if (currentNumber.includes(".")) {
    return;
  }

  if (!currentNumber) {
    expression += "0";
  }
  expression += ".";
  renderExpression();
}

function appendOperator(operator) {
  if (showingResult) {
    expression = resultDisplay.textContent;
    showingResult = false;
  }

  if (!expression) {
    if (operator === "-") {
      expression = "-";
      renderExpression();
    }
    return;
  }

  const lastCharacter = expression.at(-1);
  if ("+-*/".includes(lastCharacter)) {
    if (operator === "-" && lastCharacter !== "-") {
      expression += operator;
    } else {
      expression = expression.slice(0, -1) + operator;
    }
  } else {
    expression += operator;
  }

  renderExpression();
}

function calculate() {
  if (!expression) {
    return;
  }

  try {
    expression = formatResult(evaluateExpression(expression));
    resultDisplay.textContent = expression;
    showingResult = true;
  } catch (error) {
    expression = "";
    resultDisplay.textContent = error.message;
    showingResult = false;
  }
}

function clear() {
  expression = "";
  showingResult = false;
  renderExpression();
}

function handleInput(value) {
  if (/^\d$/.test(value)) {
    appendDigit(value);
  } else if (value === ".") {
    appendDecimal();
  } else if ("+-*/".includes(value) && value.length === 1) {
    appendOperator(value);
  } else if (value === "=" || value === "Enter") {
    calculate();
  } else if (value === "C" || value === "Escape") {
    clear();
  }
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button && buttons.contains(button)) {
    handleInput(button.textContent.trim());
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLButtonElement) {
    return;
  }

  if (/^\d$/.test(event.key) || "+-*/.".includes(event.key)) {
    event.preventDefault();
    handleInput(event.key);
  } else if (event.key === "Enter" || event.key === "Escape") {
    event.preventDefault();
    handleInput(event.key);
  }
});
