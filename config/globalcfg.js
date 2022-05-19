/**@type {MouseEvent}*/
var events;
(function() {
    window.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        events = event || window.event; // IE-ism
        /**@type {Element[]} */
        let t_path;
        [events.rx, events.ry] = (t_path = events.composedPath()).reduce(
        /**
         * 
         * @param {Array<Array<number>>} acc 
         * @param {Element} curr 
         */
        (acc,curr,i)=>{
            if(!Array.isArray(acc)) {
                let rect = acc.getBoundingClientRect();
                acc = [[],[]];
                acc[0].push(events.clientX - rect.left);
                acc[1].push(events.clientY - rect.top);
            }
            if (i > t_path.length-3) {
                return acc;
            }
            if(curr.getBoundingClientRect) {
                let rect = curr.getBoundingClientRect();
                acc[0].push(events.clientX - rect.left);
                acc[1].push(events.clientY - rect.top);
            }
            return acc;
        });
    }
})();

/**
 * 
 * @param {Element} elm 
 */
function getMousePosFrom(elm) {
    let returnValue = {x:0,y:0};
    let rect = elm.getBoundingClientRect();
    returnValue.x = events.clientX - rect.left;
    returnValue.y = events.clientY - rect.top;
    return returnValue;
}

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

Array.prototype.random = function() {
    let randIndex = Math.floor(Math.random()*this.length);
    return this[randIndex];
}

/**
 * 
 * @param {string|Array<string>} searchReplaceValue 
 * @param {string|Array<string>} searchSwapValue 
 */
String.prototype.swapAll = function(searchReplaceValue,searchSwapValue) {
    let returnValue;
    if (searchReplaceValue.constructor === Array && searchSwapValue.constructor === String) {
    }
    else if (searchReplaceValue.constructor === String && searchSwapValue.constructor === Array) {
        let swaps = 0;
        returnValue = this.split(new RegExp(`(${escapeRegex(searchReplaceValue)})`)).map(v=>
            v === searchReplaceValue ? searchSwapValue[swaps++]:
            v.replace(searchSwapValue.find(t=>v.includes(t)) ?? searchReplaceValue,searchReplaceValue)
            ).join('');
    }
    else if (searchReplaceValue.constructor === String && searchSwapValue.constructor === String){
        returnValue = this.split(new RegExp(`(${escapeRegex(searchReplaceValue)})`)).map(v=>
            v === searchReplaceValue ? searchSwapValue:
            v.replace(searchSwapValue,searchReplaceValue)).join('');
    }
    else {
        throw new Error('invalid input');
    }
    return returnValue;
}

console.log("ononon".swapAll('on',['n','b','v']));
// hom(n)ym(on)


Array.prototype.rekey = function rekey() {
    var base = {...this};
    return [...arguments].reduce((acc,cur,i)=>{
        let type = cur?.constructor;
        if(type === String) {
            acc[cur] = base[i];
            delete base[i];
        }
        else if (type === Array) {
            for (val of cur.flat()) {
                acc[val] = base[i];
            }
            delete base[i];
        }
        else if (type === Object) {
            for (key in cur) {
                acc[cur[key]] = base[key];
                delete base[key];
            }
        }
        if (i === arguments.length-1) {
            acc = {...acc,...base};
        }
        return acc;
    },{});
}

/**
 * 
 * @param {string} str 
 * @param {Object} obj
 */
 function createElement(str="div",obj= {}) {
    var elm = document.createElement(str);
    var reserved = Object.fromEntries([
        "children",
        "addEventListeners",
        "setAttributes",
        "style",
        "bond"
    ].map(v=>[v,0]));
    if (obj.addEventListeners) {
        for (let key in obj.addEventListeners) {
            elm.addEventListener(key,obj.addEventListeners[key]);
        }
    }
    if (obj.children) {
        for (let el of obj.children) {
            elm.appendChild(el);
        }
    }
    if (obj.style) {
        for (let key in obj.style) {
            elm.style[key] = obj.style[key];
        }
    }
    if (obj.bond) {

    }
    for (let key in obj) {
        if(key in reserved) {}
        else {
            elm[key] = obj[key];
        }
    }
    if (obj.setAttributes) {
        for (let key in obj.setAttributes) {
            elm.setAttribute(key,obj.setAttributes[key]);
        }
    }
    return elm;
}

function pieceMoves(type,square) {
    let rAlphaList = ["a","b","c","d","e","f","g","h"];rAlphaList.reverse();
    let alphaList =  ["a","b","c","d","e","f","g","h"];
    let rNumberList = [1,2,3,4,5,6,7,8];rNumberList.reverse();
    let numberList =  [1,2,3,4,5,6,7,8];
    let [col,row] = square.split("");
    let i=0;
    let iCol = alphaList.indexOf(col);
    let iRow = numberList.indexOf(+row);
    switch(type) {
        case "P":
        case "":
            return [
                [iCol-1,iRow+1],
                [iCol+1,iRow+1]
            ]
            .filter(v=>v.every(v=>v<8&&v>-1))
            .map(v=>alphaList[v[0]]+numberList[v[1]]);
        case "B":
            let B_ap = alphaList.slice(iCol+1);
            let B_ar = rAlphaList.slice(-iCol);
            let B_np = numberList.slice(iRow+1);
            let B_nr = rNumberList.slice(-iRow);
            let B_afp = B_ap.slice(0,7-iRow).map((v,i)=>v+B_np[i]);
            let B_afr = B_ar.slice(0,iRow).map((v,i)=>v+B_nr[i]);
            let B_adr = B_ar.slice(0,7-iRow).map((v,i)=>v+B_np[i]);
            let B_adp = B_ap.slice(0,iRow).map((v,i)=>v+B_nr[i]);
            let returnValue = [...B_afp,...B_afr,...B_adp,...B_adr];
            return returnValue;
        case "N":
            return [
                [iCol-2,iRow+1],
                [iCol-2,iRow-1],
                [iCol-1,iRow+2],
                [iCol-1,iRow-2],
                [iCol+1,iRow+2],
                [iCol+1,iRow-2],
                [iCol+2,iRow+1],
                [iCol+2,iRow-1]
            ]
            .filter(v=>v.every(v=>v<8&&v>-1))
            .map((v,i)=>alphaList[v[0]]+numberList[v[1]])
        case "R":
            return alphaList.filter(v=>v!=col).map(v=>v+row)
            .concat(
                numberList.filter(v=>v!=row).map(v=>col+v)
            );
        case "Q":
            return pieceMoves("B",square)
            .concat(
                pieceMoves("R",square)
            );
        case "K":
            return [
                [iCol-1,iRow+1],
                [iCol-1,iRow],
                [iCol-1,iRow-1],
                [iCol,iRow+1],
                [iCol,iRow-1],
                [iCol+1,iRow+1],
                [iCol+1,iRow],
                [iCol+1,iRow-1]
            ]
            .filter(v=>v.every(v=>v<8&&v>-1))
            .map(v=>alphaList[v[0]]+numberList[v[1]]);
    }
}

const isUpperCase = char => char.charCodeAt(0) >= 65 && char.charCodeAt(0)
<= 90;
const isLowerCase = char => char.charCodeAt(0) >= 97 &&
char.charCodeAt(0) <= 122;
const flipCase = str => {
   let newStr = '';
   const margin = 32;
   for(let i = 0; i < str.length; i++){
      const curr = str[i];
      if(isLowerCase(curr)){
         newStr += String.fromCharCode(curr.charCodeAt(0) - margin);
      }else if(isUpperCase(curr)){
         newStr += String.fromCharCode(curr.charCodeAt(0) + margin);
      }else{
         newStr += curr;
      };
   };
   return newStr;
};

String.prototype.flipCase = function() {
    return flipCase(this);
}

class ChessBoards {
    ascii = '';
    #asciiBorder = ['-','|','#'];
    #asciiEmpty = '\u00B7';
    #asciiScaleX = 3;
    #asciiScaleY = 1;
    fastBoard;
    get board() {
        let squares = ['a','b','c','d','e','f','g','h'];
        function rep(stack,thisValue,iter=1) {
            return Math.floor(thisValue/8**iter) ? squares[Math.floor(stack/8) % 8]+rep(Math.floor(stack/8),thisValue,++iter):'';
        }
        let make = [];
        for (let i=0; i<this.fastBoard.length; i++) {
            if (i % this.width === 0) {
                make.push([]);
            }
            make[Math.floor(i/this.width)].push(this.fastBoard[i]);
            Object.defineProperty(make,(squares[(i % this.width) % 8] + rep(i % this.width,this.width-1)).split('').reverse().join('')+make.length,{
                get: ()=>{return this.fastBoard[i]},
                set: (v) => {
                    this.fastBoard[i] = v;
                }
            })
        }
        return make;
    }
    constructor(...dimensions) {
        dimensions.length-1 || (dimensions = dimensions[0]);
        this.width = 8;
        this.height = 8;

        switch(dimensions.constructor) {
            case Number:
                dimensions > 2 &&
                dimensions === Math.floor(dimensions) &&
                ([this.width, this.height] = [dimensions,dimensions]) ||
                console.error('invalid board dimensions');
            break;
            case String:
                [this.width,this.height] = dimensions.match(/^([0-9]+)x([0-9]+)$/)?.slice(1)
                ?.map(Number)
                ?.reduce((v1,v2)=>v1>0&&v2>2||v1>2&&v2>0 ? [v1,v2]:null) ?? 
                (console.error('invalid board dimensions'),[8,8]);
            break;
            case Array:
                dimensions.length === 2 &&
                dimensions.every(Number) &&
                dimensions.some(v=>v>2) &&
                ([this.width, this.height] = dimensions) ||
                console.error('invalid board dimensions');
            break;
        }
        this.fastBoard = Array(this.width*this.height).fill('\u00B7');
        this.board["c5"] = 'p';
        console.log(this.board["c5"]);
        // this.square('d1') = new Pawn();
        this.#updateAscii();
    }
    #updateAscii() {
        let scaleX = this.#asciiScaleX;
        let scaleY = this.#asciiScaleY;
        let sizeIndent = Math.log10(this.height)+1;
        let indent = ' '.repeat(sizeIndent);
        let spaceX = ' '.repeat(scaleX);
        let squares = ['a','b','c','d','e','f','g','h'];
        let vertPiece = indent+this.#asciiBorder[2]+this.#asciiBorder[0].repeat(this.width*spaceX.length+spaceX.length-1)+this.#asciiBorder[2];
        let emptyHoriz = '  '+this.#asciiBorder[1]+(spaceX).repeat(this.width)+spaceX.slice(1)+this.#asciiBorder[1]+'\n';
        let horizPiece =emptyHoriz.repeat(scaleY-1)+'%n'+this.#asciiBorder[1]+(spaceX.slice(1)+this.#asciiEmpty).repeat(this.width)+spaceX.slice(1)+this.#asciiBorder[1];
        function rep(stack,thisValue,iter=1) {
            return Math.floor(thisValue/8**iter) ? squares[Math.floor(stack/8) % 8]+rep(Math.floor(stack/8),thisValue,++iter):'';
        }
        let bottomPiece = indent+spaceX+(() => {
                let returnValue = '';
                for (let i=0; i<this.width; i++) {
                    returnValue += 
                        (squares[i % 8] + rep(i,this.width-1)
                    ).split('').reverse().join('').padEnd(spaceX.length,' ');
                }
                return returnValue;
            }
        )();
        this.ascii = vertPiece+'\n'+(horizPiece+'\n').repeat(this.height)+emptyHoriz.repeat(scaleY-1)+vertPiece+'\n'+bottomPiece;
        this.ascii = this.ascii.swapAll('\u00B7',this.fastBoard);
        let numberList = [...Array(this.height).keys()].map(v=>(String(v+1)).padStart(Math.log10(this.height)+1,' '));
        this.ascii = this.ascii.swapAll('%n',numberList);
    }
    draw() {
    	console.log(this.ascii);
    }
}

class ChessPiece {
    constructor() {
    }
}

var chess1 = new ChessBoards("8x8");
const Bishop = new ChessPiece({
    piece: 'B',
    pattern: []
})
const Rook = new ChessPiece({
    piece: 'R',
    pattern: [
        ['0','*','0'],
        ['*','R','*'],
        ['0','*','0']
    ]
})

//var l = new Bishop();
chess1.draw();
