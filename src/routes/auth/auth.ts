import { ServerRoute } from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import Logger from "../../utils/logger";

module.exports = [
 /*    {
        method: "POST",
        path: "/auth/login",

        options: {
            description: "Realizes user-password authentication",
            notes: "Requires an valid user!",
            tags: ["api"],
            validate: {
                payload: Joi.object({
                    username: Joi.string().min(3),
                    password: Joi.string()
                })
            },
            response: {
                schema: Joi.object({
                    name: Joi.string()
                })
            }
        },

        handler: function (request, h) {     
            return {
                name: `Hello ${(request.payload as any).username}!`   
            }
        }
    }, */
] as ServerRoute[];