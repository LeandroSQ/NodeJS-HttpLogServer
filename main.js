//#region Imports
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const uuid = require("uuid");
const localtunnel = require("localtunnel");
const chalk = require("chalk");
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

//#region Express routes
app.get("/", (req, res) => {
    res.json({ message: "FUNFOU "});
});

app.post("/api/setLogApp", (req, res) => {
    let timestamp = new Date().toLocaleString();
    console.log(chalk.magenta(`[HTTP] ${timestamp} Received LOG!`));
    
    let body = JSON.stringify(req.body, 1, 2);

    let fileName = `${uuid.v4()}.log`;    
    let filePath = `${__dirname}/logs/${fileName}`;
    
    fs.writeFile(filePath, body, (error) => {
        if (error) {
            console.trace(error);
            console.error(chalk.red("[HTTP] Error while saving logs: " + error));
        } else {
            console.log(chalk.magenta("[HTTP] Log saved on File " + fileName));
        }
    });
    
    res.json({ message: "OK" });
});
//#endregion

// Starts the server
app.listen(EXPRESS_OPTIONS.port, EXPRESS_OPTIONS.host, () => {
    console.log(chalk.magenta(`[HTTP] Server listening on ${EXPRESS_OPTIONS.host} at port ${EXPRESS_OPTIONS.port}!`));

    if (LOCAL_TUNNEL_OPTIONS.enabled) startLocalTunnel();
});