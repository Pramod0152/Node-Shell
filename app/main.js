const { exit } = require("process");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

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
    const argPath = args[0];
    const paths = process.env.PATH.split(path.delimiter);
    for (const dir of paths) {
      const filePath = path.join(dir, argPath);
      try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
          continue;
        }
        fs.accessSync(filePath, fs.constants.X_OK);
        console.log(`${args[0]} is ${filePath}`);
        return;
      } catch (err) {
        continue;
      }
    }
    console.log(`${args[0]}: not found`);
  }
}

function pwdcmd() {
  console.log(process.cwd());
}

function cdcmd(...args) {
  try {
    process.chdir(args[0]);
  } catch (e) {
    console.log(`cd: ${args[0]}: No such file or directory`);
  }
}

const builtInCommands = {
  type: typecmd,
  echo: echocmd,
  exit: exitcmd,
  pwd: pwdcmd,
  cd: cdcmd,
};

function REPL() {
  rl.question("$ ", (command) => {
    const answer = command.split(" ");
    if (answer[0] in builtInCommands) {
      builtInCommands[answer[0]](...answer.slice(1));
      return REPL();
    } else {
      const child = spawn(answer[0], answer.slice(1));
      child.stdout.on("data", (data) => {
        process.stdout.write(data);
      });

      child.on("error", () => {
        console.log(`${answer[0]}: command not found`);
        return REPL();
      });

      child.on("close", () => {
        return REPL();
      });
    }
  });
}

REPL();
