//import { Chess } from "chess.js";
import {until} from "./libs/calc.js"
/*
a board that represents what is actually there
a board that represents a hovered piece
a board that represents a picked up piece
a board that represents a dragged piece
a board that represents a selected piece
a board that represents the previously selected piece
a board that represents the previously picked up piece
a board that represents the previously dropped piece
a board that represents the previous ply
*/
//document.addEventListener("keypress",specialAction);

/*
var chess1 = new ChessBoard();
var chess2 = new ChessBoard();

chess1.display.config = {draggable:true,dropOffBoard:"trash",sparePieces:true,position:"start"};
chess1.display.show();

chess1.link(chess2);

chess1.move("Ngf3");

chess1.highlightLegalMoves();

chess2.move("e4");

chess2.unlink(chess1);

chess1.piece("d2").legalMoves();
chess1.piece("d2").moves();

chess1.piece("d2").moves().highlightTo(chess2);

var virutal = chess2.simulate(function(virt) {
    virt.move("Rh4");
    return "ok";
})
*/


class ChessObject extends Chess{
    #override;
    constructor({size = "400px",title="untitled"} = {}) {
        super();
        this.#override = {
            move: this.move,
            moves: this.moves,
            clear: this.clear,
            put: this.put,
            load: this.load,
            load_pgn: this.load_pgn,
            undo: this.undo,
        }
        this.started = false;
        this.focusedSquare = "";
        this.focusedPiece = "";
        this.focusedColor = "";
        this.focusedElement;
        this.start = ({origin = true} = {}) => {
            this.started = true;
            if (origin) {
                for(let board of this.linkedBoards) {
                    board.start({origin: false});
                }
            }
        }
        this.undo = ({origin = true,animation = true, display=true} = {}) => {
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
        this.stop = ({origin = true} = {}) => {
            this.started = false;
            if (origin) {
                for (let board of this.linkedBoards) {
                    board.stop({origin: false});
                }
            }
        }
        this.ondrop = [];
        this.atdrop = [];
        this.ondragstart = [];
        this.ondragmove = [];
        /**@param {ChessObject} chessObj */
        this.link = (chessObj) => {
            this.linkedBoards.add(chessObj);
            chessObj.linkedBoards.add(this);
        }
        /**@param {ChessObject} chessObj */
        this.unlink = (chessObj) => {
            this.linkedBoards.delete(chessObj);
            chessObj.linkedBoards.delete(this);
        }
        this.load = async function(oldFen) {
            let curFen = ()=>`${this.display.fen()} ${this.orientation} - - 0 1`;
            // wait until the string updates
            if (oldFen != curFen()) {
                this.display.setPosition(oldFen,false);
            }
            else {
                await until(()=>oldFen!=curFen(),10,3);
                this.#override.load(curFen());
            }
        }
        this.updateDisplay = function({animation = false} = {}) {
            this.display.setPosition(this.fen(),animation);
        }
        this.put = async function({type, color}, square) {
            this.#override.put({type: type, color: color},square);
            this.load(this.fen());
        }
        this.highlight =async function(squares) {
            await until(async()=>this.display.shadowRoot);
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
                let $square = this.display.shadowRoot.getElementById("square-"+square.replace("x","").replace("+","").slice(-2));
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
            if (arguments.length < 2) {
                for (let board of this.linkedBoards) {
                    board.highlight(squares,false);
                }
            }
        }
        //* Implement simulated boards
        this.simulate = function(callback,{copyBoard=false,copyFocused=false,origin=true,orientation}={}) {
            orientation ??= this.orientation;
            let simul = new Chess();
            simul.clear();
            if (copyBoard) {
                simul.load(this.fen());
            }
            if (copyFocused) {
                simul.put({type:this.focusedPiece,color:this.focusedColor}, this.focusedSquare);
            }
            let stuff = callback.bind(this)(simul);
            return stuff;
        }
        /**
         * @param {string} e
         * @returns 
         */
        this.move = async function(e,{dropped=false,origin=true,animation=false,display=true,data = {},linked = true}={}) {
            let move = e.split("-").rekey("from","to");
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
                await this.load(`${this.display.fen()} ${this.orientation} - - 0 1`);
            }
            if (origin && linked) {
                for (let board of this.linkedBoards) {
                    if (!this.started || board.moveIsLegal(e)) {
                        await board.move(e,{dropped:false,origin: false,animation: animation, data: data});
                    }
                }
            }
        }
        this.moveIsLegal = function(e) {
            let move = e.split("-").rekey("from","to");
            let legalMoves = [];
            try {
            legalMoves = this.#override.moves({square: move.from, verbose: true});
            } catch{};
            let i = 0;
            for (let legalMove of legalMoves) {
                if (legalMove.to === move.to) break;
                i++;
            }
            return i<legalMoves.length;
        }
        this.highlightLegalMoves = async function(options) {
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
            let debug = document.getDebug("pieceControl");
            console.log(pieceMoves("K",debug.value));
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
            if (arguments.length < 2) {
                for (let board of this.linkedBoards) {
                    board.highlightLegalMoves(options,false);
                }
            }
        }
        let action = {
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
        // display has to be made in the constructor
        this.chessObjectId = document.chess.childElementCount;

        this.display = createElement("chess-board",{
            id:"ChessObject:"+this.chessObjectId,
            style: {
                width:size,
                display:"none"
            },
            addEventListeners: {
                ...action
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
        /**@type {Set<ChessObject>} */
        this.linkedBoards = new Set();
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
        chess1.highlight(
            chess1.simulate(
                function(board) {
                        let fen = flipCase(this.fen().slice(0,-13))+this.fen().slice(13);
                        if (!this.started) {
                            board.load(this.fen());
                            board.put({type: this.focusedPiece, color: this.focusedColor}, this.focusedSquare);
                            board.load(board.fen());
                        }
                        if (!this.started) {
                            return board.moves({square: newLocation});
                        }
                        else {
                            board.load(this.fen());
                            board.load(board.fen());
                            return board.moves({square: source});
                        }
                }
                ,{copyFocused: false}
            )
        );
    }
)

// fix instant movement
chess1.ondrop.push(
    function(e) {
        chess1.highlight([]);
    },
    /**
     * 
     * @this {ChessObject}
     */
    async function(e) {
        let legalMoves = chess1.moves({verbose: true});
        if (this.started && this.orientation === "b") {
            let legalMove = legalMoves[Math.floor(Math.random()*legalMoves.length)];
            let move = legalMove.from+"-"+legalMove.to;
            let promotion = legalMove.promotion;
            this.move(move,{animation: true});
        }
    }
)

chess1.atdrop.push(
    /**
     * 
     * @this {ChessObject}
     */
    async function(e) {
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
                console.log(rect);
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
                        await this.move(this.focusedSquare.slice(0,1)+"7-"+this.focusedSquare, {
                            data: {
                                promotion: $elm.id.slice(-1).toLowerCase()
                            },
                            display: false,
                            linked: false
                        });
                        // this.put({type: $elm.id.slice(-1), color: "w"}, this.focusedSquare);
                        this.updateDisplay();
                        for (let board of this.linkedBoards) {
                            await board.move(this.focusedSquare.slice(0,1)+"7-"+this.focusedSquare, {
                                data: {
                                    promotion: $elm.id.slice(-1).toLowerCase()
                                },
                                display: false,
                                origin: false
                            }).then(() => {
                                board.updateDisplay();
                            });
                        }
                        $elm.parentElement.remove();
                    });
                }
                this.display.shadowRoot.appendChild($test);
            }
            else if (this.focusedColor === "b" && this.focusedSquare.includes("1")) {
                exception = true;
            }
        }
        return exception;
    },
)

//chess2.put({type: "Q", color: "w"}, "e4");

window.startPosition = function() {
    chess1.start();
    console.log(chess1.started);
}
window.loadPosition = function() {
}

document.addEventListener("keypress", function(e) {
    if (e.key === "z") {
        chess1.undo();
    }
})