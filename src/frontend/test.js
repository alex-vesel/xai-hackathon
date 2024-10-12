// Sample JavaScript code

// Function to add two numbers
function add(a, b) {
    return a + b;
}

// Function to subtract two numbers
function subtract(a, b) {
    return a - b;
}

// Function to multiply two numbers
function multiply(a, b) {
    return a * b;
}

// Function to divide two numbers
function divide(a, b) {
    if (b === 0) {
        return 'Error: Division by zero';
    }
    return a / b;
}

// Function to find the maximum of two numbers
function max(a, b) {
    return (a > b) ? a : b;
}

// Function to find the minimum of two numbers
function min(a, b) {
    return (a < b) ? a : b;
}

// Example usage
console.log('Add: ' + add(5, 3)); // Output: Add: 8
console.log('Subtract: ' + subtract(5, 3)); // Output: Subtract: 2
console.log('Multiply: ' + multiply(5, 3)); // Output: Multiply: 15
console.log('Divide: ' + divide(5, 3)); // Output: Divide: 1.6666666666666667
console.log('Max: ' + max(5, 3)); // Output: Max: 5
console.log('Min: ' + min(5, 3)); // Output: Min: 3
