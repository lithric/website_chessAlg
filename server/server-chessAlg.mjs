import { createServer, ServerResponse } from 'http';
import url from 'url';
import Path from 'path';
import { readFile, readFileSync } from 'fs';

var errdir = "C:/Users/Administrator/Documents/Github/website_chessAlg"

ServerResponse.prototype.writeFile = function(filename = "",type, func = function(){}) {
    type =
    !filename.endsWith("js") ?
    !filename.endsWith("css") ?
    !filename.endsWith("png") ?
    !filename.endsWith("ico") ?
    "text/html"
    :"image/ico"
    :"image/png"
    :"text/css"
    :"text/javascript";
    readFileSync(errdir+filename,(err,data) => {
        if (err) {
            console.log(err);
        }
        else {
            this.writeHead(200, {'Content-type':type});
            this.write(data);
            func().bind(this);
        }
    })
}

const port = 8000;

const server = createServer(async(request, response) => {
    console.log(request.url);
    if(request.url == "/script.js") {
        response.writeHead(200);
        readFile('./client/script.js',(err,data) => {
            if(err) {
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        });
    }
    else if(request.url == "/style.css") {
        response.writeHead(200);
        readFile('./client/style.css',(err,data) => {
            if(err){
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        });
    }
    else if(request.url == "/libs/calc.js") {
        response.writeHead(200);
        readFile('./client/libs/calc.js',(err,data) => {
            if(err){
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        })
    }
    else if (request.url == "/config/domcfg.js") {
        response.writeHead(200);
        readFile('./client/config/domcfg.js',(err,data) => {
            if(err){
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        })
    }
    else if (request.url == "/config/globalcfg.js") {
        response.writeHead(200);
        readFile('./client/config/globalcfg.js',(err,data) => {
            if(err){
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        })
    }
    else if (request.url == "/benchmark.js") {
        response.writeHead(200);
        readFile('./node_modules/benchmark/benchmark.js',(err,data) => {
            if(err){
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        })
    }
    else if(request.url.includes('/img/chesspieces/wikipedia/')) {
        response.writeHead(200);
        readFile(`./client${request.url}`,(err,data)=>{
            if(err){
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        });
    }
    else {
        // response.writeFile('/client/index.html','text/html',function() {
        //     this
        // });
        readFile(`./client/index.html`,(err,data) => {
            if(err) {
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        });
    }
}).listen(port);