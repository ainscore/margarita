module.exports = function margs(commandName) {
    return new Program(commandName);
}

class Command {
    constructor(name="") {
        this.name = name;
        this.description = "";
        this.subCommands = [];
        this.arguments = [];
        this.options = [];
        this._action = null;   
    }

    description(description) {
        this.description = description;
        return this;
    }

    command(name) {
        let command = new Command(name);
        this.subCommands.push(command);
        return command;
    }

    action(action) {
        this._action = action;
        return this;
    }

    option(shortName, name, options) {
        if (!name) {
            name = shortName;
            shortName = '';
        }
        let {isFlag} = options || {}; 
        let option = new Option({name, shortName, isFlag});
        this.options.push(option);
        return this;
    }

    arg(argName, index) {
        let arg = new Argument(argName);
        if (index >= 0) {
            this.arguments[index] = arg;
        } else {
            this.arguments.push(arg);
        }
        return this;
    }

    getSubCommand(name) {
        return this.subCommands.find((subCommand) => subCommand.name === name);
    }

    getArgument(index) {
        return this.arguments[index];
    }

    getOption(name) {
        return this.options.find((option) => option.name === name || option.shortName === name);
    }

    error() {
        return 'fail';
    }

    usage() {
    }
    
}

class Argument {
    constructor(name) {
        this.name = name;
        this.optional = false;
        this.validation = function(){};
    }
}

class Option {
    constructor({name, shortName, isFlag}) {
        this.name = name;
        this.shortName = shortName;
        this.default = "";
        this.optional = false;
        this.hasArgs = !isFlag;
        this.valueHint = this.name;
        this.validation = function(){};
    }
}

class Program extends Command {
    parse(argv) {
        let command = this;
        let result = {};
        let argIndex = 0;
        let getArgs = false;
        let currentOption = false;
        for (let arg of argv.slice(2)) {
            if (getArgs) {
                result[currentOption.name] = arg;
                result[currentOption.shortName] = arg;
                getArgs = false;
            } else if (arg.startsWith('--') && command.getOption(arg.substring(2))) {
                currentOption = command.getOption(arg.substring(2));
                result[currentOption.name] = true;
                result[currentOption.shortName] = true;
                getArgs = currentOption.hasArgs;
            } else if (arg.startsWith('-')) {
                for (let shortArg of arg.substring(1)) {
                    if (!command.getOption(shortArg) && !getArgs) {
                        return Promise.reject();
                    }
                    if (getArgs) {
                        return Promise.reject();
                    }
                    currentOption = command.getOption(shortArg);
                    result[currentOption.name] = true;
                    result[currentOption.shortName] = true;
                    getArgs = currentOption.hasArgs;
                }
            } else if (command.getSubCommand(arg) && command.getSubCommand(arg).name === arg){
                command = command.getSubCommand(arg);
            } else if (command.getArgument(argIndex)) {
                result[command.getArgument(argIndex).name] = arg;
            } else {
                return Promise.reject(command.error());
            }
        }

        for (let arg of command.arguments) {
            if (!(arg.name in result)) {
                return Promise.reject();
            }
        }

        for (let option of command.options) {
            if (!(option.name in result)) {
                return Promise.reject();
            }
        }

        if (command._action !== null) {
            command._action(result);
        } else {
            command.error();
        }
        return Promise.resolve();
    }
}

