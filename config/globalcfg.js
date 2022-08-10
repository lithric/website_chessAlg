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
 * @param {string|Array<string>|RegExp} searchReplaceValue 
 * @param {string|Array<string>} searchSwapValue 
 */
String.prototype.swapAll = function(searchReplaceValue,searchSwapValue) {
    let returnValue;
    if (searchReplaceValue.constructor === Array && searchSwapValue.constructor === String) {
    }
    else if (searchReplaceValue.constructor === RegExp && searchSwapValue.constructor === Array) {
        let swaps = 0;
        returnValue = this.split(searchReplaceValue).map(v=>
            v.includes((searchReplaceValue+'').slice(2,-2)) ? v.replace((searchReplaceValue+'').slice(2,-2),searchSwapValue[swaps++]):v
            ).join('');
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

class ChessBoard {
    #ascii = '';
    get ascii() {
        this.#updateAscii();
        return this.#ascii;
    }
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
            make[Math.floor(i/this.width)].unshift(this.fastBoard[this.fastBoard.length-i-1]);
            Object.defineProperty(make,(squares[((this.fastBoard.length-i-1) % this.width) % 8] + rep(i % this.width,this.width-1)).split('').reverse().join('')+make.length,{
                get: ()=>{return this.fastBoard[this.fastBoard.length-i-1]},
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
        this.fastBoard = Array(this.width*this.height);
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
        this.#ascii = vertPiece+'\n'+(horizPiece+'\n').repeat(this.height)+emptyHoriz.repeat(scaleY-1)+vertPiece+'\n'+bottomPiece;
        this.#ascii = this.#ascii.swapAll(new RegExp(`(${this.#asciiEmpty})`),this.fastBoard.map(v=>v[0] ? v:[this.#asciiEmpty]));
        let numberList = [...Array(this.height).keys()].reverse().map(v=>(String(v+1)).padStart(Math.log10(this.height)+1,' '));
        this.#ascii = this.#ascii.swapAll('%n',numberList);
    }
    draw() {
        this.#updateAscii();
    	console.log(this.#ascii);
    }
    load(board) {
        let x=-1;
        let y=-1;
        let width = this.width;
        board.flat().forEach((v,i)=>{
            x = x+1 % width;
            y = y+1 -Math.ceil(x/width);
            this.fastBoard[i] = [this.#storedPieces[v]?.piece ?? null];
            if (this.fastBoard[i][0]) {
                this.fastBoard[i].piece = this.#storedPieces[v];
                this.fastBoard[i].moved = false;
                this.fastBoard[i].fastMove = function(width,cur,curPos,move,{testLegal= true,ifLegal=false}={}) {
                    let returnValue = {};
                    returnValue.bounded = true;
                    let moveVal = cur+move[0]*width+move[1];
                    if (moveVal >= this.fastBoard.length) {
                        returnValue.bounded = false;
                        moveVal = this.fastBoard.length-1;
                    };
                    if (moveVal < 0) {
                        returnValue.bounded = false;
                        moveVal = 0;
                    };
                    if (testLegal || ifLegal) {
                        returnValue.legal = false;
                        let piece = this.fastBoard[cur].piece;
                        let captured = this.fastBoard[moveVal].piece;
                        for (let condition of piece.conditions.moves) {
                            returnValue.legal ||= condition({
                                board:this,
                                piece:piece,
                                move:move,
                                moveVal:moveVal,
                                cur:curPos,
                                curVal:cur,
                                captured: captured
                            }) && condition.allowed;
                        }
                    }
                    if (cur === moveVal) return returnValue;
                    if (!ifLegal || ifLegal && returnValue.legal) {
                        this.fastBoard[cur].moved = true;
                        this.fastBoard[moveVal] = this.fastBoard[cur];
                        this.fastBoard[cur] = [null];
                    }
                    return returnValue;
                }.bind(this,width,i,[y,x]);
                this.fastBoard[i].move = function(tCol,tRow,cur,move,moveA) {
                    let moveVal = [tCol,tRow];
                    if (move.constructor === Array) {
                        moveVal = move;
                    }
                    else if (moveA) {
                        moveVal = [move,moveA];
                    }
                    else {
                        moveVal = [move,0];
                    }
                    return this.fastBoard[cur].fastMove(moveVal);
                }.bind(this,x,y,i);
            }
        });
    }
    /**
     * 
     * @returns a generator of moves
     */
    *moves() {
        console.time('mine');
        let x=-1;
        let y=-1;
        let i=-1;
        let width = this.width;
        for (let square of this.fastBoard) {
            i++;
            x = x+1 % width;
            y = y+1 -Math.ceil(x/width);
            if (square.piece === undefined) continue;
            let piece = square.piece;
            piece.piece,piece.getMoveGroup['infinite']?.(piece,i);
        }
        console.log("ok");
        console.timeEnd('mine');
    }
    /**
     * 
     * @param {Array<ChessPiece>} chessPieces 
     */
    store(chessPieces) {
        for (let piece of chessPieces) {
            this.#storedPieces[piece.piece] = piece;
            for (let rule in this.#storedPieces[piece.piece].rules) {
                this.#storedPieces[piece.piece].rules[rule].action = this.#storedPieces[piece.piece].rules[rule].action?.bind(this);
                this.#storedPieces[piece.piece].getMoveGroup[rule] = this.#storedPieces[piece.piece].getMoveGroup[rule]?.bind(this);
            }
            for (let group in this.#storedPieces[piece.piece].getMoveGroup) {
                this.#storedPieces[piece.piece].getMoveGroup[group] = this.#storedPieces[piece.piece].getMoveGroup[group]?.bind(this);
            }
            this.#storedPieces[piece.piece.toLowerCase()] = new ChessPiece({
                piece: piece.piece.toLowerCase(),
                pattern:piece.pattern.reverse().map(arr=>arr.map(v=>v[0]===piece.piece ? v.toLowerCase():v))
            });
            for (let rule in this.#storedPieces[piece.piece.toLowerCase()].rules) {
                this.#storedPieces[piece.piece.toLowerCase()].rules[rule].action = this.#storedPieces[piece.piece.toLowerCase()].rules[rule].action?.bind(this);
            }
            for (let group in this.#storedPieces[piece.piece.toLowerCase()].getMoveGroup) {
                this.#storedPieces[piece.piece.toLowerCase()].getMoveGroup[group] = this.#storedPieces[piece.piece.toLowerCase()].getMoveGroup[group]?.bind(this);
            }
        }
    }
    rules(chessRules) {
        for (let rule of chessRules) {
            this.#storedRules[rule]
        }
    }
    #storedPieces = {' ':{}}
    #storedRules = {}
}
function getAllIndexes(arr, val) {
    var indexes = [];
    for(let i = 0; i < arr.length; i++)
    {
        if (arr[i] === val)
        {
            indexes.push(i);
        }
    }
    return indexes;
}
function getAllIncludes(arr, val, index) {
    var indexes = [];
    for(let i=0; i<arr.length;i++) {
        if (arr[i].includes(val)) {
            indexes.push(i);
        }
    }
    return indexes;
}
class ChessPiece {
    constructor({piece='X', pattern=[['X']],rules}={}) {
        this.piece = piece;
        this.rules = DEFAULT_CHESS_RULES;
        if (pattern[0].constructor !== Array || pattern[0].constructor === ChessPiece || pattern[0][0].constructor === Array) {
            pattern = pattern.map(v=>v.constructor === ChessPiece ? v.pattern:v);
            if (pattern.every(v=>v.length === pattern[0].length)) {
                let combinedPattern = pattern.reduce((acc,cur)=>
                    acc.map((v1,i)=>
                    cur[i].map((v2,j)=>
                        Math.floor(acc.length/2) !== i || Math.floor(acc.length/2) !== j ? v2 !== ' ' ? v2:v1[j]:piece
                    ))
                )
                this.pattern = combinedPattern;
            }
            else {
                let size = Math.max(...pattern.map(v=>v.length));
                let parsedPatterns = pattern.map(pat=>{
                    let pot = pat.map(v=>[...Array(Math.floor(size-v.length)/2).fill(' '),...v,...Array(Math.floor(size-v.length)/2).fill(' ')]);
                    while(pot.length < size) {
                        pot.push(Array(size).fill(' '));
                        pot.unshift(Array(size).fill(' '));
                    }
                    return pot;
                });
                let combinedPattern = parsedPatterns.reduce((acc,cur)=>
                    acc.map((v1,i)=>
                    cur[i].map((v2,j)=>
                        Math.floor(acc.length/2) !== i || Math.floor(acc.length/2) !== j ? v2 !== ' ' ? v2:v1[j]:piece
                    ))
                )
                this.pattern = combinedPattern;
            }
        }
        else {
            this.pattern = pattern;
        }
        Object.assign(this.rules,rules);
        this.getMoveGroup = {};
        let patternLength = this.pattern.length;
        let middle = Math.floor(patternLength/2);
        this.conditions = {moves:[]};
        let gift = {moves:{}};
        for (let rule in this.rules) {
            if (!getAllIncludes(this.pattern.flat(),this.rules[rule].symbol).length) {
                continue;
            }
            this.getMoveGroup[this.rules[rule].stored] = this.rules[rule].getMoves;
            this.conditions.moves.push(this.rules[rule].condition);
            this.conditions.moves[this.conditions.moves.length-1].allowed = this.rules[rule].allow;
            gift.moves[this.rules[rule].stored] = getAllIncludes(
                this.pattern.flat(),
                this.rules[rule].symbol)
                .map(v=>[middle-Math.floor(v/patternLength),middle-(v % patternLength)]);
            if (gift.moves[this.rules[rule].stored].length === 0) {
                delete gift.moves[this.rules[rule].stored];
            }
        }
        this.conditions.moves = this.conditions.moves.filter(Boolean);
        this.moves = gift.moves;
    }
}

class ChessRule {
    constructor({symbol,allow=true,symbolMode='enable',condition,stored,action,moves,test}={}) {
        this.symbol = symbol;
        this.allow = allow;
        this.symbolMode = symbolMode === 'disable' ? 'disable':'enable';
        this.stored = stored;
        this.condition = condition;
        this.action = action;
        this.getMoves = moves;
        this.test = test;
    }
}

class ChessBoardProperty {
    constructor({}) {

    }
}

class ChessPieceProperty {
    constructor({}) {
    }
}

class ChessAction {
    constructor({action}) {
        this.action = action;
    }
}
/**
 ** *: can move and take infinitely in this direction
 ** +: can move and take on this square
 ** -: if square is not attacked
 ** #: can be checkmated
 ** !: is illegal to lose this piece (can be checked)
 ** _: can move to this square
 ** x: can take on this square
 ** $: at this edge of the board
 ** []: specifies a certain square (ex: x[0,0] means "can take on square (0,0) a.k.a a1")
 ** @[]: at "[]" square (row, column)
 ** @[1]: when piece is at the 1st row
 ** @[$-1]: at one away from final row of the board
 ** @[1,0]: at the "b1" (or 0,1) square
 ** @[*,0]: at the 0th column and any row
 ** =: piece can promote to (promotion squares default to the end of the board)
 ** &: and
 ** %: can en-passant on this square (defaults to pawn to en-passant)
 */

const DEFAULT_CHESS_RULES = {};
const DEFAULT_CHESS_ACTIONS = {};
DEFAULT_CHESS_ACTIONS.CAPTURE = new ChessAction({
    name: 'capture',
    action: 'move',
    allowed: true,
    condition: function({capture}) {
        return !!capture;
    }
})
DEFAULT_CHESS_ACTIONS.SELF_CAPTURE = new ChessAction({
    name: 'self-capture',
    action: 'capture',
    allowed: false,
    condition: function({curVal,moveVal,board}) {
        return !(
            isUpperCase(board.fastBoard[moveVal][0]) === 
            isUpperCase(board.fastBoard[curVal][0])
        ) || this.allowed;
    }
})
DEFAULT_CHESS_ACTIONS.MOVE = new ChessAction({
    name: 'move',
    action: function({curVal,moveVal}) {
        this.fastBoard[moveVal] = this.fastBoard[curVal];
        this.fastBoard[curVal] = [null];
    },
    allowed: true,
    condition: function() {
        return this.allowed;
    }
})
DEFAULT_CHESS_ACTIONS.KING_SIDE_CASTLE = new ChessAction({
    name: 'O-O',
    action: function({moveVal,curVal}) {
        this.fastBoard[moveVal] = this.fastBoard[curVal];
        this.fastBoard[curVal+1] = this.fastBoard[moveVal+1];
        this.fastBoard[curVal] = [null];
        this.fastBoard[moveVal+1] = [null];
    },
    allowed: true,
    condition: function({piece}) {
        return piece.canCastle;
    }
})
DEFAULT_CHESS_ACTIONS.INFINITE_TRAVEL = new ChessAction({
    name: 'travel',
    action: 'move',
    allowed: true,
    condition: function({piece,curVal,board,move}) {
        if (!piece.canTravel) return false;
        let valid = piece.moves['travel'].find(v=>
            v[0]*move[1] === v[1]*move[0] &&
            (move[0] % v[0] === 0 || move[0] === v[0]) &&
            (move[1] % v[1] === 0 || move[1] === v[1])
            );
        if (!valid) return false;
        for (let i=[0,0]; i[0]!==move[0]||i[1]!==move[1];(i[0]+=valid[0],i[1]+=valid[1])) {
            let moveVal = i[0]*board.width+i[1]+curVal;
            let captured = board.fastBoard[moveVal].piece;
            if (captured) {
                if (i[0]!==move[0]||i[1]!==move[1]) return false;
                return true;
            }
        }
        return true;
    }
})
const DEFAULT_CHESS_PIECE_PROPERTIES = {};
DEFAULT_CHESS_PIECE_PROPERTIES.ORIENTATION = new ChessPieceProperty({
    property: 'orientation',
    value: null
});
DEFAULT_CHESS_PIECE_PROPERTIES.ATTACKED = new ChessPieceProperty({
    property: 'attacked',
    value: false
})
DEFAULT_CHESS_PIECE_PROPERTIES.CHECKABLE = new ChessPieceProperty({
    symbol: '!',
    property: 'checkable',
    symbolMode: 'enable',
    value: false
})
DEFAULT_CHESS_PIECE_PROPERTIES.CAN_CASTLE = new ChessPieceProperty({
    symbol: '/',
    property: 'canCastle',
    symbolMode: 'enable',
    value: false,
    get: function({piece,curVal,board}) {
        if (!piece.canCastle) return false;
        if (piece.moved) return false;
        if (piece.castled) return false;
        let castleVal = -1;
        for (let i=curVal - (curVal % board.width); i<curVal; i++) {
            if (board.fastBoard[i].isCastle) {
                castleVal = i;
                break;
            }
        }
        if (castleVal<0) {
            let i = curVal;
            while(i-- > curVal-(curVal % board.width)) {
                if (board.fastBoard[i].isCastle) {
                    castleVal = i;
                    break;
                }
            }
        };
        if (castleVal<0) return false;
        if (board.fastBoard[castleVal].moved) return false;
        for (let i=1; i<castleVal-curVal;i++) {
            if (board.fastBoard[curVal+i].piece) return false;
            if (board.fastBoard[curVal+i].attacked) return false;
        }
        if (piece.inCheck) return false;
        return true;
    }
}); // done
DEFAULT_CHESS_PIECE_PROPERTIES.CASTLED = new ChessPieceProperty({
    property: 'castled',
    value: false
})
DEFAULT_CHESS_PIECE_PROPERTIES.IS_CASTLE = new ChessPieceProperty({
    symbol: '&',
    property: 'isCastle',
    symbolMode: 'enable',
    value: false
})
DEFAULT_CHESS_PIECE_PROPERTIES.IN_CHECK = new ChessPieceProperty({
    property: 'checked',
    value: false,
    get: function({piece}) {
        if (!piece.checkable) return false;
        if (!piece.attacked) return false;
        return true;
    }
}) // done
DEFAULT_CHESS_PIECE_PROPERTIES.MOVED = new ChessPieceProperty({
    property: 'moved',
    value: false
})
DEFAULT_CHESS_PIECE_PROPERTIES.MOVEABLE = new ChessPieceProperty({
    property: 'moveable',
    value: true
})
const DEFAULT_CHESS_BOARD_PROPERTIES = {};
DEFAULT_CHESS_BOARD_PROPERTIES.ORIENTATION = new ChessBoardProperty({
    property: 'orientation',
    value: 'w',
    onMove: function() {
        this.orientation = this.orientation === 'w' ? 'b':'w';
        for (let index in this.fastBoard) {
            if (!this.fastBoard[index].piece) continue;
            this.fastBoard[index].piece.moveable = !this.fastBoard[index].piece.moveable;
        }
    }
})
DEFAULT_CHESS_BOARD_PROPERTIES.CHECKED_PIECES = new ChessBoardProperty({
    property: 'checkedPieces',
    value: [],
    onMove: function() {
        this.checkedPieces = this.fastBoard.map((v,i)=>[v.piece,i]).filter(v=>v[0]?.checked);
    }
});

// send a signal to other squares when a piece is moved
// if a signal hits a checkable piece, send another signal from that piece
// use this signal to ping other pieces that may have put it in check

DEFAULT_CHESS_RULES.INFINITE_TRAVEL = new ChessRule({
    symbol: '*',
    stored: 'infinite',
    priority: 1,
    condition: function({board,piece,move,curVal}) {
        let valid = piece.moves['infinite'].find(v=>
            v[0]*move[1] === v[1]*move[0] &&
            (move[0] % v[0] === 0 || move[0] === v[0]) &&
            (move[1] % v[1] === 0 || move[1] === v[1])
            );
        if (!valid) return false;
        for (let i=[0,0]; i[0]!==move[0]||i[1]!==move[1];(i[0]+=valid[0],i[1]+=valid[1])) {
            let moveVal = i[0]*board.width+i[1]+curVal;
            let captured = board.fastBoard[moveVal].piece;
            if (captured) {
                if (i[0]!==move[0]||i[1]!==move[1]) return false;
                return true;
            }
        }
        return true;
    },
    /**
     * 
     * @this {ChessBoard}
     */
    moves: function(piece,cur) {
        let returnValue = [];
        let x = cur % this.width;
        let y = Math.floor(cur/this.width);
        let px = this.width-x-1;
        let py = this.height-y-1;
        for (let direction of piece.moves['infinite']) {
            let pxOften = Math.floor(Math.abs(direction[1] < 0 ?
                x/(direction[1] || 1):
                px/(direction[1] || 1)
                ));
            let pyOften = Math.floor(Math.abs(direction[0] < 0 ?
                y/(direction[0] || 1):
                py/(direction[0] || 1)
                ));
            let often = Math.min(pxOften,pyOften);
            let crdOften = [direction[0]*often,direction[1]*often];
            for (let i=[0,0]; i[0]!==crdOften[0]||i[1]!==crdOften[1];(i[0]+=direction[0],i[1]+=direction[1])) {
                let moveVal = (i[0]+direction[0])*this.width+(i[1]+direction[1])+cur;
                let captured = this.fastBoard[moveVal].piece;
                let parsedMoveVal = [Math.floor(moveVal/this.width),moveVal % this.width];
                if (captured) {
                    if (i[0]!==crdOften[0]&&i[1]!==crdOften[1]) break;
                    let legal = this.action['capture'].testLegal({curVal,moveVal});
                    if (!legal) break;
                    returnValue.push(parsedMoveVal);
                }
                returnValue.push(parsedMoveVal);
            }
        }
        return returnValue;
    },
    /**
     * 
     * @this {ChessBoard}
     */
    action: function(piece,move,cur) {
        let moveVal = move[0]*this.width+move[1];
        this.fastBoard[moveVal] = this.fastBoard[cur];
        this.fastBoard[cur] = [null];
    }
});
DEFAULT_CHESS_RULES.CAPTURES = new ChessRule({
    symbol: 'x',
    stored: 'capture',
    priority: 1,
    condition: function({piece,move,captured}) {
        if (!captured) return false;
        if (!piece.moves['capture'].length) return false;
        if (!piece.moves['capture'].some(v=>v[0]===move[0]&&v[1]===move[1])) return false;
        return true;
    },
    action: function(piece,move,cur) {
        let moveVal = move[0]*this.width+move[1];
        this.fastBoard[moveVal] = this.fastBoard[cur];
        this.fastBoard[cur] = [null];
    }
});
DEFAULT_CHESS_RULES.MOVES = new ChessRule({
    symbol: '_',
    stored: 'move',
    priority: 1,
    condition: function({piece,move,captured}) {
        if (!piece.moves['move'].length) return false;
        if (captured) return false;
        return piece.moves['move'].some(v=>v[0]===move[0]&&v[1]===move[1]);
    },
    action: function(piece,move,cur) {
        let moveVal = move[0]*this.width+move[1];
        this.fastBoard[moveVal] = this.fastBoard[cur];
        this.fastBoard[cur] = [null];
    }
});
DEFAULT_CHESS_RULES.TAKES = new ChessRule({
    symbol: '+',
    stored: 'static',
    priority: 1,
    condition: function({piece,move,captured}) {
        let valid = piece.moves['static'].some(v=>v[0]===move[0]&&v[1]===move[1]);
        let friend = piece.rules['FRIENDLY_CAPTURES'].test({piece:piece,captured:captured});
        if (friend) return false;
        if (!piece.moves['static'].length) return false;
        if (!valid) return false;
        return true;
    },
    action: function(piece,move,cur) {
        let moveVal = move[0]*this.width+move[1];
        this.fastBoard[moveVal] = this.fastBoard[cur];
        this.fastBoard[cur] = [null];
    }
});
DEFAULT_CHESS_RULES.FRIENDLY_CAPTURES = new ChessRule({
    symbol: '~',
    allow: false,
    symbolMode: 'disable',
    stored: 'friendly',
    priority: 2,
    condition:  function({piece,move,captured}) {
        if (!captured) return false;
        if (!piece.moves['friendly'].length) return false;
        if (!piece.moves['friendly'].some(v=>v[0]===move[1]&&v[1]===move[1])) return false;
        if (isUpperCase(captured.piece) !== isUpperCase(piece.piece)) return false;
        return true;
    },
    test: function({piece,captured}) {
        let needed = piece.rules['FRIENDLY_CAPTURES']?.allow ?? this.allow;
        if (!captured) return needed;
        if (isUpperCase(captured.piece) !== isUpperCase(piece.piece)) return needed;
        return !needed;
    },
    action: function(piece,move,cur) {
        let moveVal = move[0]*this.width+move[1];
        this.fastBoard[moveVal] = this.fastBoard[cur];
        this.fastBoard[cur] = [null];
    }
});
DEFAULT_CHESS_RULES.KING_SIDE_CASTLING = new ChessRule({
    symbol: '>',
    stored: 'KCastling',
    condition: function({board,piece,moveVal,curVal}) {
        let rook = board.fastBoard[moveVal+1];
        if(!piece.moves['KCastling'].length) return false; 
        if(rook.piece !== 'R' || rook.piece !== 'r') return false;
        if(piece.moved) return false;
        if(rook.moved) return false;
        if(curVal >= moveVal) return false;
        return true;
    },
    action: function(piece,move,cur) {
        let moveVal = move[0]*this.width+move[1];
        this.fastBoard[moveVal] = this.fastBoard[cur];
        this.fastBoard[cur+1] = this.fastBoard[moveVal+1];
        this.fastBoard[cur] = [null];
    }
});
DEFAULT_CHESS_RULES.QUEEN_SIDE_CASTLING = new ChessRule({
    symbol: '<',
    stored: 'QCastling',
    condition: function({board,piece,moveVal,curVal}) {
        if (!piece.moves['QCastling'].length) return false;
        let rook = board.fastBoard[moveVal-2];
        if(rook.piece !== 'R' || rook.piece !== 'r') return false;
        if(piece.moved) return false;
        if(rook.moved) return false;
        if(curVal <= moveVal) return false;
        return true;
    }
});
DEFAULT_CHESS_RULES.PASSANT = new ChessRule({
    symbol: '^',
    stored: 'passant',
    condition:  function({piece}) {
        if (!piece.moves['passant'].length) return false;
        return piece.moved;
    },
    /**
     * @this {ChessBoard}
     */
    action: function(piece,move,cur) {
        let passant = (move[0]-1)*this.width+move[1];
        this.fastBoard[passant].enpassant = true;
    }
});
DEFAULT_CHESS_RULES.ENPASSANT = new ChessRule({
    symbol: '%',
    stored: 'enpassant',
    condition: function({board,piece,moveVal}) {
        if (!piece.moves['enpassant'].length) return false;
        return board.fastBoard[moveVal].enpassant ?? true;
    },
    /**
     * @this {ChessBoard}
     */
    action: function(piece,move,cur) {
        let moveVal = move[0]*this.width+move[1];
        this.fastBoard[moveVal] = this.fastBoard[cur];
        this.fastBoard[cur] = [null];
    }
});
DEFAULT_CHESS_RULES.PROMOTION = new ChessRule({
    symbol: '=',
    stored: 'promote',
    priority: 1,
    condition: function({board,piece,moveVal}) {
        if (!piece.moves['promote'].length) return false;
        return moveVal > board.width*(board.height-1) || moveVal < board.width;
    }
});

const Bishop = new ChessPiece({
    piece: 'B',
    pattern: [
        ['*',' ','*'],
        [' ','B',' '],
        ['*',' ','*']
    ]
});

const Knight = new ChessPiece({
    piece: 'N',
    pattern: [
        [' ','+',' ','+',' '],
        ['+',' ',' ',' ','+'],
        [' ',' ','N',' ',' '],
        ['+',' ',' ',' ','+'],
        [' ','+',' ','+',' ']
    ]
})

const Rook = new ChessPiece({
    piece: 'R',
    pattern: [
        [' ','*',' '],
        ['*','R','*'],
        [' ','*',' ']
    ]
})

const Queen = new ChessPiece({
    piece: 'Q',
    pattern: [Rook,Bishop]
});

const Fairy = new ChessPiece({
    piece: 'F',
    pattern: [Queen,Knight]
});

const Pawn = new ChessPiece({
    piece: 'P',
    pattern: [
        [' ', ' ','^' ,' ' ,' '],
        [' ','x%','_' ,'x%',' '],
        [' ', ' ','P=',' ' ,' '],
        [' ', ' ',' ' ,' ' ,' '],
        [' ', ' ',' ' ,' ' ,' ']
    ]
});

const King = new ChessPiece({
    piece: 'K',
    pattern: [
        [' ',' ',' ',' ',' '],
        [' ','+','+','+',' '],
        ['<','+','K#!','+','>'],
        [' ','+','+','+',' '],
        [' ',' ',' ',' ',' ']
    ]
});

const Gambit = new ChessBoard("8x8");

Gambit.store([
    King,
    Fairy,
    Queen,
    Bishop,
    Knight,
    Rook,
    Pawn
])
// Gambit.rules([
//     Castling,
//     EnPassant
// ])
Gambit.load([
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p',' ','p','p','p'],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ','p',' ',' ',' '],
    [' ',' ',' ',' ','P',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    ['P','P','P','P',' ','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
])
Gambit.draw();
let future = Gambit.moves(); // returns a generator of moves
future.next();