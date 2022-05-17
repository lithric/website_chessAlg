import { Chess } from "./node_modules/chess.js/chess.js";

import {sleep, until, Calc} from "./libs/calc.js"

class ChessObject extends Chess {
    #action = {
        "drag-start": (e) => {
            const {source, piece, position, orientation} = e.detail;
            this.focusedSquare = source;
            this.focusedPiece = piece.slice(1);
            this.focusedColor = piece.slice(0,1);
            let $pieceRef = this.display.shadowRoot.getElementById("square-"+source);
            this.focusedElement = $pieceRef?.firstElementChild;
            /**@type {Array<HTMLImageElement>} */
            let $imgs = [];
            let i=0;
            for  (let func of this.ondragstart) {
                func.bind(this)(e);
            }
            for (let board of this.linkedBoards) {
                let $piece = board.display.shadowRoot.getElementById("square-"+source);
                if($piece) {
                    $piece.part.add("highlight");
                    let $img = $piece.getElementsByClassName("piece-image")[0];
                    if($img) {
                        $img.style.transform = `translate(-50%,-50%) translate(${getMousePosFrom($pieceRef).x}px,${getMousePosFrom($pieceRef).y}px)`;
                        $img.style.position = "relative";
                        $img.style.zIndex = 100;
                        $imgs.push($img);
                        i++;
                    }
                }
            }
            document.onmousemove = () => {
                for (let $img of $imgs) {
                    if ($img) {
                        $img.style.transform = `translate(-50%,-50%) translate(${getMousePosFrom($pieceRef).x}px,${getMousePosFrom($pieceRef).y}px)`;
                        $img.style.position = "relative";
                        $img.style.zIndex = 100;
                    }
                }
            }
        },
        "drag-move": (e) => {
            const {newLocation, oldLocation, source, piece} = e.detail;
            this.focusedSquare = newLocation;
            this.focusedPiece = piece.slice(1);
            this.focusedColor = piece.slice(0,1);
            for (let func of this.ondragmove) {
                func.bind(this)(e);
            }
            for (let board of this.linkedBoards) {
                let $root = board.display.shadowRoot;
                $root.getElementById("square-"+oldLocation)?.part?.remove("highlight");
                $root.getElementById("square-"+newLocation)?.part?.add("highlight");
                $root.getElementById("square-"+source)?.part?.add("highlight");
            }
        },
        "drop": async(e) => {
            const {source, target, setAction, piece} = e.detail;
            this.focusedSquare = target;
            this.focusedPiece = piece.slice(1);
            this.focusedColor = piece.slice(0,1);
            document.onmousemove = function() {};
            let legalMove = this.moveIsLegal(source+"-"+target);
            if (this.started && !legalMove) {
                setAction("snapback");
            }
            else {
                let exception = false;
                for (let func of this.atdrop) {
                    exception ||= await func.bind(this)(e);
                }
                exception || await this.move(source+"-"+target);
                this.focusedElement = this.display.shadowRoot.getElementById("square-"+target)?.firstElementChild;
            }
            for (let func of this.ondrop) {
                await func.bind(this)(e);
            }
            for (let board of this.linkedBoards) {
                let $root = board.display.shadowRoot;
                let $piece = $root.getElementById("square-"+source);
                if ($piece) {
                    $piece.part.remove("highlight");
                    $root.getElementById("square-"+target)?.part?.remove("highlight");
                    let $img = $piece.getElementsByClassName("piece-image")[0];
                    if ($img) {
                        $img.style.transform = "";
                        $img.style.zIndex = 0;
                    }
                }
            }
        }
    }
    /**@type {Set<ChessObject>} */
    linkedBoards = new Set();
    started = false;
    focusedSquare = "";
    focusedPiece = "";
    focusedColor = "";
    focusedElement;
    ondrop = [];
    atdrop = [];
    ondragstart = [];
    ondragmove = [];
    chessObjectId;
    display;
    orientation;
    #override = new Chess();
    constructor({size = "400px",title="untitled",fen = "",display = true} = {}) {
        super();
        fen != "" && this.#override.load(fen);
        if (display) {
            this.chessObjectId = document.chess.childElementCount;
            this.display = createElement("chess-board",{
                id:"ChessObject:"+this.chessObjectId,
                style: {
                    width:size,
                    display:"none"
                },
                addEventListeners: {
                    ...this.#action
                }
            });
            this.orientation = this.display.orientation[0];
            Object.defineProperties(this.display,{
                config: {
                    get: ()=>{
                        console.log(this.display);
                        return {
                            appearSpeed: this.display.getAttribute("appear-speed"),
                            draggablePieces: this.display.getAttribute("draggable-pieces"),
                            dropOffBoard: this.display.getAttribute("drop-off-board"),
                            hideNotation: this.display.getAttribute("hide-notation"),
                            moveSpeed: this.display.getAttribute("move-speed"),
                            orientation: this.display.getAttribute("orientation"),
                            snapSpeed: this.display.getAttribute("snap-speed"),
                            snapbackSpeed: this.display.getAttribute("snapback-speed"),
                            sparePieces: this.display.getAttribute("spare-pieces"),
                            trashSpeed: this.display.getAttribute("trash-speed"),
                            position: this.display.getAttribute("position"),
                        }
                    },
                    set: (obj)=>{
                        let valid = ["appear-speed","draggable-pieces","drop-off-board",
                                    "hide-notation","move-speed","orientation","snap-speed",
                                    "snapback-speed","spare-pieces","trash-speed","position"];
                        let validPair = ["appearSpeed","draggable","dropOffBoard",
                                        "hideNotation","moveSpeed","orientation","snapSpeed",
                                        "snapbackSpeed","sparePieces","trashSpeed","position"];
                        for (let key in obj) {
                            if (valid.includes(key)) {
                                this.display.setAttribute(key,obj[key]);
                            }
                            else if (validPair.includes(key)) {
                                this.display.setAttribute(valid[validPair.indexOf(key)],obj[key]);
                            }
                        }
                    }
                }
            });
            this.display.show = function(){
                this.style.display = "block";
            }
            this.display.hide = function(){
                this.style.display = "none";
            }
            document.chess.appendChild(this.display);
        }
    }
    reset = ({animation = false, origin = true} = {}) => {
        this.#override.reset();
        this.updateDisplay({animation: animation});
        if (origin) 
        {
            for (let board of this.linkedBoards) {
                board.reset({animation: animation, origin: false});
            }
        }
    }
    /**
     * @param {Object} options
     * @param {boolean} options.flip
     * @param {boolean|string} options.meta
     * @param {Object} options.set
     * @param {string} options.set.position
     * @param {string} options.set.orientation
     * @param {string} options.set.castling
     * @param {string} options.set.enPassant
     * @param {string} options.set.halfMoves
     * @param {string} options.set.fullMoves
     * @returns {string}
     */
    fen = (options = {}) => {
        /*
        this.fen({set: {
            castling: "asdwa",
            position: "adw"
        }})
        */
        let fen = this.#override.fen();
        let pFen = fen.split(' ').rekey("position","orientation","castling","enPassant","halfMoves","fullMoves");
        let finalFen = ' ';
        let setFen = ' ';
        /*
        castling  meta
        orientation meta
        half-move meta
        full-move meta
        */
        if (options.meta ?? true) {
            let meta = options.meta ?? "position, orientation, castling, enPassant, halfMoves, fullMoves";
            finalFen += meta.includes("position") ? (options.flip ? pFen.position.flipCase()+' ':pFen.position+' '):'' 
            finalFen += meta.includes("orientation") ? pFen.orientation+' ':'';
            finalFen += meta.includes("castling") ? pFen.castling+' ':'';
            finalFen += meta.includes("enPassant") ? pFen.enPassant+' ':'';
            finalFen += meta.includes("halfMoves") ? pFen.halfMoves+' ':'';
            finalFen += meta.includes("fullMoves") ? pFen.fullMoves+' ':'';
            finalFen = finalFen.trimEnd();
        }
        else {
            finalFen += options.flip ? pFen.position.flipCase()+' ':pFen.position+' ';
        }
        if (options.set ?? false) {
            setFen += (options.set.position ?? pFen.position)+' ';
            setFen += (options.set.orientation ?? pFen.orientation)+' ';
            setFen += (options.set.castling ?? pFen.castling)+' ';
            setFen += (options.set.enPassant ?? pFen.enPassant)+' ';
            setFen += (options.set.halfMoves ?? pFen.halfMoves)+' ';
            setFen += (options.set.fullMoves ?? pFen.fullMoves)+' ';
            setFen = setFen.trim();
            this.#override.load(setFen);
            this.updateDisplay();
        }
        finalFen = finalFen.trim();
        return finalFen;
    }
    ascii = () => {
        return this.#override.ascii();
    }
    moves = (options = {}) => {
        var Δboard = new Chess(this.#override.fen());
        /**
         * 
         * @param {ChessInstance} board 
         * @returns {ChessInstance[]}
         */
        function getSubBoards(board) {
            if (Array.isArray(board)) {
                let subBoards = [];
                for (let subBoard of board) {
                    subBoards.push(getSubBoards(subBoard));
                }
                return subBoards.flat(1);
            }
            else {
                let subBoards = [];
                let moves = board.moves();
                for (let move of moves) {
                    let subBoard = new Chess();
                    subBoard.load_pgn(board.pgn());
                    subBoard.move(move);
                    subBoards.push(subBoard);
                }
                return subBoards;
            }
        }
        /**
         * 
         * @param {ChessInstance} board
         */
        function getSubMoves(depth=0,prevMoves=[],threats=false,prevBThreats = [],prevWThreats = [],white = false,black = true) {
            if (depth === 0) {
                let moves = [];
                Δboard.moves().forEach((move,i)=>{
                    moves.push([...prevMoves,move]);
                    if (threats) {
                        black && (moves[i].bThreats = [...prevBThreats,Δboard.threats({swap: true})]);
                        white && (moves[i].wThreats = [...prevBThreats,Δboard.threats({swap: false})]);
                    }
                });
                return moves;
            }
            else {
                let Δhistory = [];
                let moves = Δboard.moves();
                moves.forEach(move=>{
                    Δboard.move(move);
                    Δhistory.push(getSubMoves(depth-1,[...prevMoves,move],threats,
                        black ? [...prevBThreats,Δboard.threats({swap: false})]:[],
                        white ? [...prevWThreats,Δboard.threats({swap: true})]:[],
                        white,
                        black
                    ));
                    Δboard.undo();
                });
                return Δhistory.flat();
            }
        }
        if (options.depth > -1) {
            let depth = options.depth;
            if (options.boards) {
                let fin = this.#override;
                while(depth--) {
                    fin = getSubBoards(fin);
                }
                return getSubBoards(fin);
            }
            else {
                if (options.threats) {
                    return getSubMoves(depth,[],true,[],[],options.white,options.black);
                }
                else {
                    return getSubMoves(depth);
                }
            }
        }
        else {
            if (options.boards) {
                return getSubBoards(this.#override);
            }
            else {
                return this.#override.moves(options);
            }
        }
    };
    getRandomMove = () => {
        let legalMoves = this.#override.moves({verbose: true});
        let legalMove = legalMoves.random();
        return legalMove.from + '-' + legalMove.to
    }
    start = ({origin = true} = {}) => {
        this.started = true;
        if (origin) {
            for(let board of this.linkedBoards) {
                board.start({origin: false});
            }
        }
    }
    stop = ({origin = true} = {}) => {
        this.started = false;
        if (origin) {
            for (let board of this.linkedBoards) {
                board.stop({origin: false});
            }
        }
    }
    undo = ({origin = true,animation = true, display=!!this.display} = {}) => {
        let move = this.#override.undo();
        if (move) {
            display && this.updateDisplay({animation: animation});
            if(origin) {
                for (let board of this.linkedBoards) {
                    board.undo({origin: false, animation: animation, display: display});
                }
            }
        }
        return move;
    }
    /**@param {ChessObject} chessObj */
    link = (chessObj) => {
        this.linkedBoards.add(chessObj);
        chessObj.linkedBoards.add(this);
    }
    /**@param {ChessObject} chessObj */
    unlink = (chessObj) => {
        this.linkedBoards.delete(chessObj);
        chessObj.linkedBoards.delete(this);
    }
    load = async(oldFen) => {
        if (!!this.display) {
            let curFen = ()=>`${this.display.fen()} ${this.orientation} - - 0 1`;
            if (oldFen != curFen()) {
                !!this.display && this.display.setPosition(oldFen,false);
            }
            else {
                await until(()=>oldFen!=curFen(),10,3);
                this.#override.load(curFen());
            }
        }
        else {
            this.#override.load(oldFen);
        }
    }
    clear = () => {
        this.#override.clear();
        this.updateDisplay();
    }
    board = this.#override.board;
    updateDisplay = ({animation = false} = {}) => {
        !!this.display && this.display.setPosition(this.fen(),animation);
    }
    simulate = (callback,{copyBoard=false,copyFocused=false,origin=true,orientation}={}) => {
        orientation ??= this.orientation;
        let simul = new ChessObject({display: false});
        if (copyBoard) {
            simul.load(this.fen());
        }
        if (copyFocused) {
            simul.put({type:this.focusedPiece,color:this.focusedColor}, this.focusedSquare);
        }
        let stuff = callback.bind(this)(simul);
        return stuff;
    }
    turn = () => {
        return this.#override.turn();
    }
    /**
     * @param {string} e
     */
    move = async(e,{dropped=false,origin=true,animation=false,display=!!this.display,data = {},linked = true,updateDisplay=false}={}) => {
        let move;
        if (e.includes("-")) {
            move = e.split("-").rekey("from","to");
        }
        else {
            move = e;
        }
        if (e.includes("O") || e.includes("o")) {
            move = e.toUpperCase();
        }
        for (let key in data) {
            move[key] = data[key];
        }
        try {
            this.#override.move(move);
        } catch{};
        dropped || display && this.display.move(e,animation);
        if (this.started) {
            this.orientation = this.orientation === "w" ? "b":"w";
        }
        else {
            display && await this.load(`${this.display.fen()} ${this.orientation} - - 0 1`);
        }
        if (updateDisplay) {
            this.updateDisplay({animation: animation});
        }
        if (origin && linked) {
            for (let board of this.linkedBoards) {
                await board.move(e,{dropped:false,origin: false,animation: animation, data: data, updateDisplay: updateDisplay, display: display});
            }
        }
    }
    pinned = (square, {swap = false} = {}) => {
        this
    }
    attacked = (square, {swap = false} = {}) => {
        return this.#override.attacked(color,square);
    }
    #swap_color = (color) => {
        return color === "w" ? "b":"w";
        // return color.swap("w","b");
    }
    put = async({type, color}, square) => {
        this.#override.put({type: type, color: color},square);
        !!this.display && this.updateDisplay();
    }
    /**
     * 
     * @param {Array<string>} squares 
     */
    highlight = async(squares,{origin = true} = {}) => {
        await until(async()=>this.display.shadowRoot);
        let castleMap = {'O-O':this.turn() == 'w' ? 'Kg1':'Kg8','O-O-O':this.turn() == 'w' ? 'Kc1':'Kc8'};
        squares = squares.map(v=>castleMap[v]??v);
        console.log(squares);

        for (let $square of this.display.shadowRoot.querySelectorAll(".legalSquare")) {
            $square.classList.remove("legalSquare");
            for (let i=0; i<8;i++) {
                $square.classList.remove("legalSquareOverlap"+i);
            }
            $square.style.filter = "";
            $square.style.boxShadow = "";
        }
        for (let square of squares) {
            let $square = this.display.shadowRoot.getElementById("square-"+square.replace("x","").replace("+","").replace("#","").slice(-2));
            if($square) {
                if(!$square.classList.contains("legalSquare")) {
                    $square.classList.add("legalSquare")
                    // fix the piece hovering higliight issue
                    $square.style.boxShadow = `inset 0 ${$square.clientHeight+1}px rgba(0,0,0,0.3)`;
                }
                else {
                    let shadowStyle = "";
                    let i = 0;
                    for (i; $square.classList.contains("legalSquareOverlap"+i) && i<=6 ;i++) {
                    }
                    $square.classList.add("legalSquareOverlap"+i);
                    shadowStyle =
                    i == 0 &&
                    "rgba(255,0,0,0.3)" ||
                    i == 1 &&
                    "rgba(0,255,0,0.3)" ||
                    i == 2 &&
                    "rgba(0,0,255,0.3)" ||
                    i == 3 &&
                    "rgba(255,0,255,0.3)" ||
                    i == 4 &&
                    "rgba(0,255,255,0.3)" ||
                    i == 5 &&
                    "rgba(255,255,0,0.3)" ||
                    i == 6 &&
                    "rgba(255,255,255,0.5)"
                    $square.style.boxShadow = `inset 0 ${$square.clientHeight+1}px ${shadowStyle}`;
                }
            }
        }
        if (origin) {
            for (let board of this.linkedBoards) {
                board.highlight(squares,{origin: false});
            }
        }
    }
    get = this.#override.get;
    moveIsLegal = (e) => {
        let verbose = true;
        let move;
        if (e.includes("-")) {
            move = e.split("-").rekey("from","to");
        }
        else {
            move = e;
            verbose = false;
        }
        if (e.includes("O")) {
            move = e;
            verbose = false;
        }
        let legalMoves = [];
        try {
        legalMoves = this.#override.moves({square: move.from, verbose: verbose});
        } catch{};
        let i = 0;
        for (let legalMove of legalMoves) {
            if (legalMove.to === move.to) break;
            i++;
        }
        return i<legalMoves.length;
    }
    threats = this.#override.threats;
    highlightLegalMoves = async(options,{origin = true} = {}) => {
        await until(async()=>this.display.shadowRoot);
        for (let $square of this.display.shadowRoot.querySelectorAll(".legalSquare")) {
            $square.classList.remove("legalSquare");
            for (let i=0; i<8;i++) {
                $square.classList.remove("legalSquareOverlap"+i);
            }
            $square.style.filter = "";
            $square.style.boxShadow = "";
        }
        let squares = this.#override.moves(options);
        for (let square of squares) {
            let $square = this.display.shadowRoot.getElementById("square-"+square.replace("x","").replace("+","").replace("#","").slice(-2));
            if($square) {
                if(!$square.classList.contains("legalSquare")) {
                    $square.classList.add("legalSquare")
                    // fix the piece hovering higliight issue
                    $square.style.boxShadow = `inset 0 ${$square.clientHeight+1}px rgba(0,0,0,0.3)`;
                }
                else {
                    let shadowStyle = "";
                    let i = 0;
                    for (i; $square.classList.contains("legalSquareOverlap"+i) && i<=6 ;i++) {
                    }
                    $square.classList.add("legalSquareOverlap"+i);
                    shadowStyle =
                    i == 0 &&
                    "rgba(255,0,0,0.3)" ||
                    i == 1 &&
                    "rgba(0,255,0,0.3)" ||
                    i == 2 &&
                    "rgba(0,0,255,0.3)" ||
                    i == 3 &&
                    "rgba(255,0,255,0.3)" ||
                    i == 4 &&
                    "rgba(0,255,255,0.3)" ||
                    i == 5 &&
                    "rgba(255,255,0,0.3)" ||
                    i == 6 &&
                    "rgba(255,255,255,0.5)"
                    $square.style.boxShadow = `inset 0 ${$square.clientHeight+1}px ${shadowStyle}`;
                }
            }
        }
        if (origin) {
            for (let board of this.linkedBoards) {
                board.highlightLegalMoves(options,{origin: false});
            }
        }
    }
}

document.addDebug(
    "pieceControl",
    createElement("input",{
        type: "text",
        value: "e4"
    })
);

createElement("div",{
    id: "bob",
    addEventListeners: {
        focus: function() {}
    },
    setAttributes: {
        uid: "ok",
        "x-factor": "ok"
    }
});

var chess1 = new ChessObject();
chess1.display.config = {
    draggable:true,
    dropOffBoard:"trash",
    sparePieces:true,
    position:"start"
}

var chess2 = new ChessObject();
chess2.display.config = {
    draggable:true,
    dropOffBoard:"trash",
    sparePieces:false,
    position:"start"
}

chess1.display.show();
chess2.display.show();

chess1.link(chess2);

chess1.ondragstart.push(
    function(e) {
        const {source} = e.detail;
        chess1.highlight(
            chess1.simulate(
                function(board) {
                    board.load(board.fen());
                    return board.moves({square: source});
                }
                ,{copyBoard: true}
            )
        );
    }
)

chess1.ondragmove.push(
    /**
     * 
     * @this {ChessObject}
     * @param {Object} e
     * @param {Object} e.detail
     * @param {String} e.detail.newLocation the square the piece is hovered over
     * @param {String} e.detail.source the square the piece came from
     */
    function(e) {
        const {newLocation, source} = e.detail;
        // fix castling is not being highlighted
        chess1.highlight(
            chess1.simulate(
                /**
                 * 
                 * @param {*} board
                 * @this {ChessObject} 
                 * @returns 
                 */
                function(board) {
                    board.load(this.fen());
                    this.started || board.put({type: this.focusedPiece, color: this.focusedColor}, this.focusedSquare);
                    board.load(board.fen());
                    return board.moves({square: this.started ? source:newLocation});
                }
                ,{copyFocused: false}
            )
        );
    }
)

function smartRandom(moves) {
    let takes = moves.filter(v=>v.includes("x"));
    let checks = moves.filter(v=>v.includes("+"));
    let mate = moves.filter(v=>v.includes("#"))[0];
    let randomMove = moves.random();
    let randomTake = takes.random();
    let randomCheck = checks.random();
    let randomChoices = [randomMove,randomTake,randomCheck].filter(v=>v);
    let randomChoice = randomChoices.random();
    let finalMove = mate ?? randomChoice;
    return finalMove;
}

function materialCount(board) {
    const typeToValueMap = {
        'p':{'w':1,'b':-1},
        'n':{'w':3,'b':-3},
        'b':{'w':3,'b':-3},
        'r':{'w':5,'b':-5},
        'q':{'w':10,'b':-10},
        'k':{'w':0,'b':0}
    }
    return board.board().flatMap(v1=>v1.map(v2=>v2 ? typeToValueMap[v2.type][v2.color]:0)).reduce((v1,v2)=>v1+v2);
}

chess1.ondrop.push(
    function(e) {
        chess1.highlight([]);
    },
    function(e) {
        let num = materialCount(this);
        console.log(`material balance: ${num}`);
    },
    /**
     * 
     * @this {ChessObject}
     */
    // async function(e) {
    //     if (this.started && this.orientation === "b") {
    //         await sleep(100);
    //         this.move(this.getRandomMove(),{animation: true});
    //     }
    // },
    // async function(e) {
    //     if (this.started && this.orientation === "b") {
    //         await sleep(100);
    //         let moves = this.moves();
    //         let takes = moves.filter(v=>v.includes("x"));
    //         let checks = moves.filter(v=>v.includes("+"));
    //         let mate = moves.filter(v=>v.includes("#"))[0];
    //         let randomMove = moves.random();
    //         let randomTake = takes.random();
    //         let randomCheck = checks.random();
    //         let randomChoices = [randomMove,randomTake,randomCheck].filter(v=>v);
    //         let randomChoice = randomChoices.random();
    //         console.log(randomChoice);
    //         this.move(mate ?? randomChoice,{
    //             display: false,
    //             updateDisplay: true,
    //             animation: true
    //         });
    //     }
    // }
    async function(e) {
        if (this.started && this.turn() === "b") {
            await sleep(100);
            let piece = (pm) => (['N','B','R','Q','K'].find(v=>v==pm.slice(0,1)) ?? 'P') + pm.replace(/[NR]x?([a-h]).*|.*/g,'$1');
            let square = (pm) => [...(this.turn() === "b" ? ['g8','c8']:['g1','c1'])][['O-O','O-O-O'].indexOf(pm)] ?? pm.replace(/[NBRQK]?x?[a-h]?x?([a-h][1-8]).*|.*/,'$1');
            let mats = (pm) => [1,3,3,5,10,0][['P','N','B','R','Q','K'].indexOf(piece(pm).slice(0,1))] ?? 0;
            let moves = this.moves();
            let devMove = moves.random();
            let devScore = 0;
            let devMaterial = 100;
            let devMatMove = moves.random();
            let lossDevMaterial = 0;
            let lossDevScore = 0;
            let finalMove = moves.random();
            let colorMult = this.turn() == "b" ? 1:-1;
            let currentBoard = this;
            for (let firstMove of moves) {
                await this.simulate(async function(board){
                    board.load(this.fen());
                    await board.move(firstMove); // blacks move
                    let moves = board.moves();
                    let matureDevScore = 500;
                    let matureDevMaterial = -500;
                    for (let secondMove of moves) {
                        let movScore = await board.simulate(async function(board){
                            board.load(this.fen());
                            await board.move(secondMove); // whites move
                            let matureMatCalc = 0;
                            if (secondMove.includes("x")) {
                                board.moves().forEach(thirdMove=>{
                                    let matCalc = 0;
                                    if (firstMove.includes('x')) {
                                        matCalc += mats(currentBoard.get(square(firstMove)).type.toUpperCase());
                                    }
                                    if (thirdMove.includes('x') && !board.threats().includes(square(thirdMove))) {
                                        console.log('takeBack',firstMove,secondMove,thirdMove,
                                        (matCalc = -mats(board.get(square(thirdMove)).type.toUpperCase())));
                                    }
                                    else if (thirdMove.includes('+') && !board.threats().includes(square(thirdMove))) {
                                        console.log('tactics',firstMove,secondMove,thirdMove,
                                        (matCalc = mats(board.get(square(secondMove)).type.toUpperCase())));
                                    }
                                    else if (!board.threats().includes(square(thirdMove))) {
                                        console.log(
                                            'loss',firstMove,secondMove,thirdMove,
                                            (matCalc = mats(board.get(square(secondMove)).type.toUpperCase()))
                                        );
                                    }
                                    else {
                                        console.log(
                                            'huge loss',firstMove,secondMove,thirdMove,
                                            (matCalc = Math.max(mats(board.get(square(secondMove)).type),mats(thirdMove)))
                                        )
                                    }
                                    matureMatCalc = Math.min(matureMatCalc,matCalc*colorMult);
                                });
                            }
                            // how many moves does black have
                            if (board.moves().filter(v=>v.includes("#")).length) {
                                return [500,-500];
                            }
                            return [board.moves().length, (materialCount(board)+matureMatCalc)*colorMult];
                        });
                        matureDevScore = Math.min(matureDevScore,movScore[0]);
                        matureDevMaterial = Math.max(matureDevMaterial,movScore[1]);
                    }
                    if (matureDevScore > devScore) {
                        devScore = matureDevScore;
                        devMove = firstMove;
                        lossDevMaterial = matureDevMaterial;
                    }
                    if (matureDevMaterial < devMaterial) {
                        devMaterial = matureDevMaterial;
                        devMatMove = firstMove;
                        lossDevScore = matureDevScore;
                    }
                });
            }
            console.log(devMaterial,lossDevMaterial,devScore,lossDevScore);
            if (devMaterial < -1 && devMaterial > -500) {
                finalMove = devMatMove
                console.log(devMatMove,devMove);
            }
            else if (lossDevMaterial > 0 && lossDevMaterial != devMaterial) {
                finalMove = devMatMove;
                console.log(devMatMove,devMove);
            }
            else {
                finalMove = devMove;
                console.log(devMatMove,devMove);
            }
            this.move(finalMove,{
                display: false,
                updateDisplay: true,
                animation: true
            });
        }
    }
)

chess1.atdrop.push(
    /**
     * 
     * @this {ChessObject}
     */
    async function(e) {
        const {target,source} = e.detail;
        let exception = false;
        if (this.focusedPiece === "P") {
            if (this.focusedColor === "w" && this.focusedSquare.includes("8")) {
                exception = true;
                //await until(()=>this.focusedElement.getBoundingClientRect().width != 0,1000,5);
                const rect = this.focusedElement.getBoundingClientRect();
                const left = rect.left;
                const top = rect.top;
                const height = rect.height;
                const width = rect.width;
                let $test = createElement("div",{
                        style: {
                            top: `${top-height*1.5}px`,
                            left: `${left-width/2}px`,
                            width: "200px",
                            height: "50px",
                            position: "absolute",
                            backgroundColor: "grey",
                            display: "flex"
                        },
                        children: [
                            this.display.shadowRoot.getElementById("spare-piece-wQ").cloneNode(true),
                            this.display.shadowRoot.getElementById("spare-piece-wR").cloneNode(true),
                            this.display.shadowRoot.getElementById("spare-piece-wB").cloneNode(true),
                            this.display.shadowRoot.getElementById("spare-piece-wN").cloneNode(true)
                        ]
                    });
                for (let $elm of $test.children) {
                    $elm.addEventListener("click",async () => {
                        await this.move(source+"-"+target, {
                            data: {
                                promotion: $elm.id.slice(-1).toLowerCase()
                            },
                            display: false,
                            updateDisplay: true
                        });
                        $elm.parentElement.remove();
                    });
                }
                this.display.shadowRoot.appendChild($test);
            }
            else if (this.focusedColor === "b" && this.focusedSquare.includes("1")) {
                exception = true;
                const rect = this.focusedElement.getBoundingClientRect();
                const left = rect.left;
                const top = rect.top;
                const height = rect.height;
                const width = rect.width;
                let $test = createElement("div",{
                        style: {
                            top: `${top-height*1.5}px`,
                            left: `${left-width/2}px`,
                            width: "200px",
                            height: "50px",
                            position: "absolute",
                            backgroundColor: "grey",
                            display: "flex"
                        },
                        children: [
                            this.display.shadowRoot.getElementById("spare-piece-bQ").cloneNode(true),
                            this.display.shadowRoot.getElementById("spare-piece-bR").cloneNode(true),
                            this.display.shadowRoot.getElementById("spare-piece-bB").cloneNode(true),
                            this.display.shadowRoot.getElementById("spare-piece-bN").cloneNode(true)
                        ]
                    });
                for (let $elm of $test.children) {
                    $elm.addEventListener("click",async () => {
                        await this.move(this.focusedSquare.slice(0,1)+"2-"+this.focusedSquare, {
                            data: {
                                promotion: $elm.id.slice(-1).toLowerCase()
                            },
                            display: false,
                            updateDisplay: true
                        });
                        $elm.parentElement.remove();
                    });
                }
                this.display.shadowRoot.appendChild($test);
            }
        }
        return exception;
    },
    /**
     * 
     * @this {ChessObject} 
     */
    async function(e) {
        let exception = false;
        const {target, piece} = e.detail;
        const castling = this.fen({meta: "castling"});
        console.log(castling);
        if (piece === "wK") {
            if (target === "g1") {
                if (castling.includes("K")) {
                    exception = true;
                    await this.move("O-O", {
                        display: false,
                        updateDisplay: true
                    });
                }
            }
            else if (target === "c1" || target === "b1") {
                if (castling.includes("Q")) {
                    exception = true;
                    await this.move("O-O-O", {
                        display: false,
                        updateDisplay: true
                    });
                }
            }
        }
        else if (piece === "bK") {
            if (target === "g8") {
                if (castling.includes("k")) {
                    exception = true;
                    console.log(this.moves());
                    await this.move("o-o", {
                        display: false,
                        updateDisplay: true
                    });
                }
            }
            else if (target === "c8" || target === "b8") {
                if (castling.includes("q")) {
                    exception = true;
                    await this.move("o-o-o", {
                        display: false,
                        updateDisplay: true
                    });
                }
            }
        }
        return exception;
    }
)

//chess2.put({type: "Q", color: "w"}, "e4");

window.startPosition = function() {
    var $option1 = document.getElementById("turn-white").checked;
    var $option3 = document.getElementById("white-king-castle").checked;
    var $option4 = document.getElementById("white-queen-castle").checked;
    var $option5 = document.getElementById("black-king-castle").checked;
    var $option6 = document.getElementById("black-queen-castle").checked;
    chess1.fen({set:{
        orientation: $option1 ? "w":"b",
        castling: ($option3 ? 'K':'')+($option4 ? 'Q':'')+($option5 ? 'k':'')+($option6 ? 'q':'') || '-',
        enPassant: '-'
    }})
    console.log(chess1.fen());
    chess1.start();
}
window.stopPosition = function() {
    chess1.stop();
}
window.resetPosition = function() {
    chess1.reset({animation: true});
}
window.loadPosition = function() {
}

document.addEventListener("keypress", function(e) {
    if (e.key === "z") {
        chess1.undo();
    }
})