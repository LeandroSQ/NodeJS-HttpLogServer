import chalk from "chalk";
import { Request } from "@hapi/hapi";

type Tag = {
    string: String,
    tag: String,
    color: Function
};

export default class Logger {

    private static highlightTag(tag: String): Tag {
        let fn = (x) => x;

        switch (tag) {
            case "error":
                fn = chalk.red;
                break;
            case "server":
                fn = chalk.yellow;
                break;
            case "plugin": 
                fn = chalk.blue;
                break;
            case "route": 
                fn = chalk.green;
                break;
            case "controller":
            case "auth":
                fn = chalk.cyan;
                break;
            case "database":
                fn = chalk.magenta;
                break;
            case "debug": 
                fn = chalk.bgMagenta;
                break;
            case "info":
                fn = chalk.gray;
                break;
        }

        return {
            string: tag.toLocaleUpperCase(),
            tag: fn("[" + tag.toLocaleUpperCase() + "]"),
            color: fn
        }
    }

    private static highlightPartials(str: String, tags: Tag[]) {
        return str
                    .replace(/\'(.*?)\'/g, tags[tags.length - 1].color("'$1'"))
                    .replace(/\"(.*?)\"/g, tags[tags.length - 1].color("$1"));
    }

    public static log(...tmp: any[]) {
        let args = [...tmp];

        // Handles the tag listing
        let tags = args[0];
        if (!Array.isArray(tags)) { tags = [tags]; }

        // Parses and highlights the tags according
        tags = tags.map(x => this.highlightTag(x.toString().toLocaleLowerCase()));
        let tagsText = tags.map(x => x.tag).join("");

        // Removes the tags argument
        args.shift();

        // Check if there is an exception
        if (args.some(x => x instanceof Error)) {
            let error = args.pop();
            let txt = this.highlightPartials(args.join(" "), tags);
            console.error(tagsText + " " + txt);
            console.trace(error);
        } else {
            let txt = this.highlightPartials(args.join(" "), tags);
            console.log(tagsText + " " + txt);
        }

    }

    public static route(request: Request) {
        let color = {
            "POST": chalk.green,
            "GET": chalk.cyan,
            "PUT": chalk.yellow,
            "DELETE": chalk.red
        }[request.method.toUpperCase()];

        Logger.log(["server", "route"], `-> ${color('[' + request.method.toUpperCase() + ']')} ${chalk.gray(request.path)}`);
    }

    public static exception(description: string, exception: Error | any): void {
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