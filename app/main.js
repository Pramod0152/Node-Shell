const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// TODO: Uncomment the code below to pass the first stage
function prompt() {
  rl.question("$ ", (command) => {
    if (command.trim() === "exit 0") {
      rl.close();
      process.exit(0);
    } else if (command.startsWith("echo ")) {
      const args = command.slice(5).trim();
      console.log(args);
      prompt();
    } else {
      console.log(`${command}: command not found`);
      prompt();
    }
  });
}

prompt();
