const { exit } = require("process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtInCommands = {
  type: "type",
  echo: "echo",
  exit: "exit",
};

// TODO: Uncomment the code below to pass the first stage
function prompt() {
  rl.question("$ ", (command) => {
    const trimmedCommand = command.trim().split(" ");
    const first = trimmedCommand[0];
    const args = trimmedCommand.slice(1).join(" ");
    if (first === "type") {
      if (builtInCommands[args]) {
        console.log(`${args} is a shell builtin`);
      } else {
        console.log(`${args}: not found`);
      }
    } else if (first === "echo") {
      console.log(args);
    } else if (first === "exit") {
      rl.close();
      process.exit(0);
    } else {
      console.log(`${command}: command not found`);
    }
    prompt();
  });
}

prompt();
