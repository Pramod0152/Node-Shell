const { exit } = require("process");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const os = require("os");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function tokenize(line) {
  const args = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let tokenStarted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' && !inDouble) {
      inDouble = true;
      tokenStarted = true;
      continue;
    }

    if (ch === '"' && inDouble) {
      inDouble = false;
      tokenStarted = true;
      continue;
    }

    if (ch === "'" && inDouble) {
      current += ch;
      continue;
    }
    if (ch === "'" && !inDouble && !inSingle) {
      inSingle = true;
      tokenStarted = true;
      continue;
    }

    if (ch === "'" && inSingle && !inDouble) {
      inSingle = false;
      tokenStarted = true;
      continue;
    }


    

    // Unquoted whitespace ends the current token
    if (!inSingle && !inDouble && /\s/.test(ch)) {
      if (tokenStarted) {
        args.push(current);
        current = "";
        tokenStarted = false;
      }
      continue;
    }

    // Normal char
    current += ch;
    tokenStarted = true;
  }

  // Push last token
  if (tokenStarted) args.push(current);

  return args;
}

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
    if (args[0] === `~`) {
      const homeDir = os.homedir();
      process.chdir(homeDir);
      return;
    } else {
      process.chdir(args[0]);
      return;
    }
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
    const tokens = tokenize(command);

    if (tokens.length === 0) {
      return REPL();
    }

    if (tokens[0] in builtInCommands) {
      builtInCommands[tokens[0]](...tokens.slice(1));
      return REPL();
    } else {
      const child = spawn(tokens[0], tokens.slice(1));
      child.stdout.on("data", (data) => {
        process.stdout.write(data);
      });

      child.on("error", () => {
        console.log(`${tokens[0]}: command not found`);
        return REPL();
      });

      child.on("close", () => {
        return REPL();
      });
    }
  });
}

REPL();
