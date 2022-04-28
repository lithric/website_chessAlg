const http = require('http');
const createServer = http.createServer;
const ServerResponse = http.ServerResponse;
const fs = require('fs');
const readFile = fs.readFile;
const mime = require("mime-types");

ServerResponse.prototype.readFile = function(reqUrl) {
    return new Promise((resolve,reject) => {
        readFile(__dirname+reqUrl,(err,data) => {
            if (err) {
                reject(err);
            }
            else {
                this.writeHead(200, {'Content-Type':mime.lookup(reqUrl)});
                resolve(data);
            }
        })
    })
}

ServerResponse.prototype.writeFile = async function(reqUrl) {
    return this.readFile(reqUrl)
    .then((data)=>{
        this.write(data);
    })
    .catch((err)=>{console.log(err)});
}

const port = 8000;
const hostname = "localhost";

const server = createServer(async(request, response) => {
    console.log(request.url);
    if (!["/","/node_modules/chessboard-element/index.js"].includes(request.url)) {
        await response.writeFile(request.url);
        response.end();
    }
    else if (request.url != "/") {
        await response.writeFile(request.url);
        response.end();
    }
    else {
        await response.writeFile("/index.html");
        response.end();
    }
}).listen(port,hostname);
console.log(`server started at-> http://${hostname}:${port}/`);