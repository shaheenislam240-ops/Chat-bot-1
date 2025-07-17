const { spawn } = require("child_process");
const express = require('express');
const path = require('path');
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8080;

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});

function startBot() {
    const child = spawn("node", ["--trace-warnings", "Cyber.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit !== 0) {
            console.log(`Restarting bot...`);
            startBot();
        }
    });

    child.on("error", (error) => {
        console.log(`Error: ${error.message}`);
    });
}

startBot();
