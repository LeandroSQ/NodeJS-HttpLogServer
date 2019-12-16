`use strict`;
// Imports
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const ServerController = require("../dist/controller/ServerController.js").default;

// Definition
const server = new ServerController();

// Initialization
server.start();