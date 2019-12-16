const fs = require("fs");
const path = require("path");

function convertToKebabCase (str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')    // get all lowercase letters that are near to uppercase ones
            .replace(/[\s_]+/g, '-')                  // replace all spaces and low dash
            .toLowerCase();                           // convert to lower case
}

function renameFiles(folder, recursionLevel = 0) {
    try {
        // Lists all files inside the given folder
        let files = fs.readdirSync (folder);

        // Iterates trough every file
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileStatus = fs.statSync (`${folder}${file}`);
            
            // Check file availability
            if (!fileStatus) {
                return console.error(`Error getting file '${file}' status.`);
            }

            // If is a directory, analyzes it's children
            if (fileStatus.isDirectory ()) {
                renameFiles (`${folder}/${file}/`, recursionLevel + 1);
            } else {
                // Check for the file extension
                let fileExtension = path.extname(file);
                if ([".js", ".ts"].indexOf(fileExtension) !== -1) {
                    // Removes the file extension
                    var filename = path.basename (file, ".js");
                    var newFilename = convertToKebabCase(filename);
                    try {
                        console.log(`Converting '${filename}' to '${newFilename}'`);
                        fs.renameSync(`${folder}${filename}`, `${folder}${newFilename}`);
                    } catch (e) {
                        console.error(`Unable to import route(s) from file '${filename}'`, e);
                    }
                }
            }
        }
        
    } catch (e) {
        console.error(`Unable to list routes on the '${folder}' directory!`, e);
    }
}
  
