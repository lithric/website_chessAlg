import { sleep } from '../Libraries/libraries/calc.mjs';
import { until } from '../Libraries/libraries/calc.mjs';
import { createServer } from 'http';
import url from 'url';
import Path from 'path';
import { readFile } from 'fs';

const port = 8000;

const server = createServer(async(request, response) => {
    console.log(request.url);
    if(request.url == "/script.js") {
        response.writeHead(200);
        readFile('./chessAlg/script.js',(err,data) => {
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
        readFile('./chessAlg/style.css',(err,data) => {
            if(err){
                console.log(err);
            }
            else {
                response.write(data);
                response.end();
            }
        });
    }
    else if(request.url == "/Libraries/libraries/calc.js") {
        response.writeHead(200);
        readFile('./Libraries/libraries/calc.js',(err,data) => {
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
        readFile(`./chessAlg${request.url}`,(err,data)=>{
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
        readFile(`./chessAlg/index.html`,(err,data) => {
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