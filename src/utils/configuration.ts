import fs from "fs";
import path from "path";

let environment = process.env.environment || "dev";
let filePath = path.join(__dirname, `../`, `config-${environment}.json`);
let fileContent = fs.readFileSync(filePath);
let object = JSON.parse(fileContent.toString());

export default object;