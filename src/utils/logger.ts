import chalk from "chalk";

export default class Logger {

    public static exception(description: string, exception: Error|any): void {
        console.error(chalk.red("[ERROR] " + description));
        console.trace(exception);
    }

    public static error(...args: any[]): void {
        let argumentsText = args.join(" ");
        let label = chalk.red("[ERROR] ");
        console.error(label + argumentsText);
    }

    public static debug(...args: any[]): void {
        let argumentsText = args.join(" ");
        let label = chalk.magenta("[DEBUG] ");
        console.debug(label + argumentsText);
    }

    public static server(...args: any[]): void {
        let argumentsText = args.join(" ");
        let label = chalk.yellow("[SERVER] ");
        console.debug(label + argumentsText);
    }

    public static info(...args: any[]): void {
        let argumentsText = args.join(" ");
        let label = chalk.cyan("[DEBUG] ");
        console.debug(label + argumentsText);
    }

}