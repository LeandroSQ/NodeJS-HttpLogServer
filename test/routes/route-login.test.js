// Imports
const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const ServerController = require("../../dist/controller/ServerController.js").default;

describe("POST /auth/login", () => {
    let server;

    // Setups the server
    beforeEach(async () => {
        server = new ServerController();
        await server.start();
    })

    // Disposes the server
    afterEach(async () => {
        await server.stop();
    })

    it("responds with 200", async () => {
        const res = await server.inject({
            method: "post",
            url: "/auth/login",
            payload: {
                username: "admin",
                password: "admin"
            }
        });

        expect(res.statusCode).to.equal(200);
    });

});