//#region Imports
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const uuid = require("uuid");
const localtunnel = require("localtunnel");
const chalk = require("chalk");
const serveIndex = require('serve-index')
//#endregion

// Localtunnel configuration
const LOCAL_TUNNEL_OPTIONS = {
    subdomain: "promoterk2020",
    host: "http://serverless.social",
    port: 7070,
    enabled: false
};
let localtunnelInstance = null;
function startLocalTunnel() {
    try {
        if (localtunnelInstance) {
            console.log(chalk.yellow("[Tunnel] Closing previous instance..."));

            localtunnelInstance.close();
            localtunnelInstance = null;
    
            setTimeout(startLocalTunnel, 100);
        } else {
            console.log(chalk.yellow(`[Tunnel] Trying to start localtunnel`));

            localtunnel(LOCAL_TUNNEL_OPTIONS)
                .then(x => {
                    localtunnelInstance = x;
                    console.log(chalk.yellow(`[Tunnel] Started at ${localtunnelInstance.url}`));

                    localtunnelInstance.on("request", info => {
                        console.info(chalk.yellow(`[Tunnel] Request received!`) + " " + chalk.green(`${info.method} ${info.path}`));
                    });

                    localtunnelInstance.on("error", error => {
                        console.error(chalk.red(`[Tunnel] Error! ${error}`));
                        setTimeout(startLocalTunnel, 100);
                    });

                    localtunnelInstance.on("close", () => {
                        console.log(chalk.red("[Tunnel] Closed!"));
                        setTimeout(startLocalTunnel, 100);
                    });
                })
                .catch(error => {
                    console.error(chalk.red(`[Tunnel] Error caught 'promise'! ${error}`));
                    console.trace(error);
                    setTimeout(startLocalTunnel, 100);
                });
        }
    } catch (e) {
        console.error(chalk.red(`[Tunnel] Error caught! ${e}`));
        console.trace(e);
        setTimeout(startLocalTunnel, 100);
    }    
}

// Express app definition
const EXPRESS_OPTIONS = {
    host: "0.0.0.0",
    port: process.env.PORT || 7070
};
let app = express();
app.use(bodyParser.json({ extended: true }));
app.use(
    '/ftp', 
    express.static('log files'), 
    serveIndex('log files', { 
        "icons": true, 
        "view": "details",
        "sort": function (file1, file2) {
            // sort ".." to the top
            if (file1.name === '..' || file2.name === '..') 
                return file1.name === file2.name ? 0 : file1.name === '..' ? -1 : 1;

            // sort directories first then sort files by date of modification
            return Number(file2.stat && file2.stat.isDirectory()) - Number(file1.stat && file1.stat.isDirectory()) || new Date(file2.stat.mtime) - new Date(file1.stat.mtime);
        }
    })
);

//#region Express routes
app.get("/", (req, res) => {
    res.json({ message: "Server log working flawlessly "});
});

app.get("/api/logCount", (req, res) => {
    fs.readdir(`${__dirname}/log files/`, (error, files) => {
        if (error) {
            console.error(error);
            res.json({ message: "Unable to fetch the log file count!\n" + error });
        } else {
            res.json({ message: `There are ${files.length} logs in the log directory!`});
        }
    });
});

app.post("/api/setLogApp", (req, res) => {
    try {
        let timestamp = new Date().toLocaleString();
        console.log(chalk.magenta(`[HTTP] ${timestamp} Received LOG!`));
        
        let body = JSON.stringify(req.body, 1, 2);
    
        let fileName = `${uuid.v4()}.log`;    
        let folderPath = `${__dirname}/log files/`;
        let filePath = `${folderPath}${fileName}`;
    
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        
        fs.writeFile(filePath, body, (error) => {
            if (error) {
                console.trace(error);
                console.error(chalk.red("[HTTP] Error while saving logs: " + error));
            } else {
                console.log(chalk.magenta("[HTTP] Log saved on File " + fileName));
            }
        });
        
        res.json({ message: "OK" });
    } catch (e) {
        console.error(chalk.red(e));
        console.trace(e);
    }
});
//#endregion

// Starts the server
app.listen(EXPRESS_OPTIONS.port, EXPRESS_OPTIONS.host, () => {
    console.log(chalk.magenta(`[HTTP] Server listening on ${EXPRESS_OPTIONS.host} at port ${EXPRESS_OPTIONS.port}!`));

    if (LOCAL_TUNNEL_OPTIONS.enabled) startLocalTunnel();
});