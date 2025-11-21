const { exit } = require("process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function exitcmd(...args) {
  rl.close();
  process.exit(0);
}

function echocmd(...args) {
  console.log(args.join(" "));
}

function typecmd(...args) {
  if (args[0] === undefined) {
    console.log("type: missing argument");
  } else if (args[0] in builtInCommands) {
    console.log(`${args[0]} is a shell builtin`);
  } else {
    console.log(`${args[0]}: not found`);
  }
}

const builtInCommands = {
  type: typecmd,
  echo: echocmd,
  exit: exitcmd,
};
// TODO: Uncomment the code below to pass the first stage
// function prompt() {
//   rl.question("$ ", (command) => {
//     const trimmedCommand = command.trim().split(" ");
//     const first = trimmedCommand[0];
//     const args = trimmedCommand.slice(1).join(" ");
//     if (first === "type") {
//       if (builtInCommands[args]) {
//         console.log(`${args} is a shell builtin`);
//       } else {
//         console.log(`${args}: not found`);
//       }
//     } else if (first === "echo") {
//       console.log(args);
//     } else if (first === "exit") {
//       rl.close();
//       process.exit(0);
//     } else {
//       console.log(`${command}: command not found`);
//     }
//     prompt();
//   });
// }

// prompt();

function REPL() {
  rl.question("$ ", (command) => {
    const answer = command.split(" ");
    if (answer[0] in builtInCommands) {
      builtInCommands[answer[0]](...answer.slice(1));
    } else {
      console.log(`${command}: command not found`);
    }
    REPL();
  });
}

REPL();
