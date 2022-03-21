import { createServer } from 'http';
import url from 'url';
import Path from 'path';
import { readFile } from 'fs';

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
    else if (request.url == "/domcfg.js") {
        response.writeHead(200);
        readFile('./client/domcfg.js',(err,data) => {
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