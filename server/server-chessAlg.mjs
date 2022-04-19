import { createServer, ServerResponse } from 'http';
import url from 'url';
import Path from 'path';
import { readFile, readFileSync } from 'fs';
import mime from 'mime-types';

var serverDir = "C:/Users/Administrator/Documents/Github/website_chessAlg";
ServerResponse.prototype.readFile = function(reqUrl) {
    return new Promise((resolve,reject) => {
        readFile(serverDir+reqUrl,(err,data) => {
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
        await response.writeFile("/client/index.html");
        response.end();
    }
}).listen(port);