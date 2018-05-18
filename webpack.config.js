"use strict";

const path = require("path");
const glob = require("glob");

let entry = {
    sanitize: "./src/index"
};
let testsFiles = glob.sync("./tests/**/*-spec.js");

testsFiles.forEach(filePath => {
    let fileName = filePath.split(/[\\/]/) || [];
    fileName = fileName.pop();
    let entryName = fileName.split(".")[0];
    
    entry[ entryName ] = filePath;
});

module.exports = {
    devtool: "source-map",
    entry,
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
    
    optimization: {
        // We no not want to minimize our code.
        minimize: false
    },
    
    module: {
        rules: [
            // {
            //     exclude: /(node_modules)/,
            //     test: /\.js$/,
            //     loader: "babel-loader",
            //     query: {
            //         presets: ["es2015"]
            //     }
            // }
        ]
    }
};
