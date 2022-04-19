
class MainBoard {
    constructor(id="board",config={draggable:true,dropOffBoard:"trash",sparePieces:true,position:"start"}) {
        this.started = false;
        this.selectedSquare = null;
        this.hoveredSquare = null;
        this.previousSquare = null;
        this.chess = new Chess();
        this.empty = new Chess();this.empty.clear();
        this.$board = document.getElementById("board");
        this.$board.onclick = () => {
            if (this.previousSquare == this.selectedSquare) {
                var square = [...document.querySelectorAll(":hover")].at(-1);
                if (this.started) {
                    square?.classList?.contains("highlight-legal") &&
                    this.chessboard.move(`${this.selectedSquare}-${square.getAttribute("data-square")}`);
                }
                else {
                    this.chessboard.move(`${this.selectedSquare}-${square}`);
                }
                [...document.body.getElementsByClassName("highlight-legal")]?.forEach(
                    function(elm) {
                        elm.classList?.remove("highlight-legal");
                    }
                );
            }
        };
        this.$square = function(chessStr = new Array()) {
            chessStr = [...arguments].flat().map(elm => {
                return this.$board.getElementsByClassName("square-"+elm?.slice(-2))[0];
            });
            return chessStr;
        }
        config.onChange = () => {
            if (this.started) {
            }
            else {
                this.change();
            }
        }
        config.onMouseoverSquare = (square) => {
            this.hoveredSquare = square;
        }
        config.onDragStart = (square) => {
            this.previousSquare = this.selectedSquare;
            this.selectedSquare = square;
            this.change();
        }
        config.onMouseoutSquare = (square) => {
            if (this.hoveredSquare == square) {
                this.hoveredSquare = null;
            }
        }
        config.onDragMove = () => {};
        config.onDrop = (a,square) => {
            this.previousSquare = this.selectedSquare;
            this.selectedSquare = square;
            console.log(square);
            if (this.$square([this.selectedSquare])[0]?.classList?.contains("highlight-legal") && this.started) {
                this.change(a,square);
            }
            else if (this.started) {
                return 'snapback';
            }
        }
        this.chessboard = Chessboard(id,config);
    }
}

MainBoard.prototype.updateFen = async function(source,target) {
    var boardFen = () => this.chessboard.fen();
    var chessFen = () => this.chess.fen().replace(/([^ ]+).*/g,"$1");
    if(this.started) {
        this.chess.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        this.chessboard.position(chessFen());
    }
    else {
        let turn = document.getElementById("turn-white").checked ?"w":"b";
        let castle = [
            document.getElementById("white-king-castle").checked ?"K":" ",
            document.getElementById("white-queen-castle").checked ?"Q":" ",
            document.getElementById("black-king-castle").checked ?"k":" ",
            document.getElementById("black-queen-castle").checked ?"q":" ",
        ].reduce(function(acc,cur) {
            return acc + cur;
        }).replace("    ","-");
        let enpassant = document.getElementById("en-passant-display").innerText;
        let halfmoves = document.getElementById("halfmoves").value;
        halfmoves = halfmoves ? halfmoves:"0";
        let fullmoves = document.getElementById("fullmoves").value;
        fullmoves = fullmoves ? fullmoves:"1";
        await until(async()=>boardFen()==chessFen());
        let fenString = `${this.chessboard.fen()} ${turn} ${castle} ${enpassant} ${halfmoves} ${fullmoves}`;
        this.chess.load(fenString);
    }
}

MainBoard.prototype.change = async function(source,target) {
    /* before change */
    this.empty.clear();

    /* changing... */
    await this.updateFen(source,target);

    /* after change */
    console.log(this.chess.get(this.selectedSquare));
    this.empty.put(this.chess.get(this.selectedSquare),this.selectedSquare);
    console.log(this.empty.ascii());
    [...document.body.getElementsByClassName("highlight-legal")]?.forEach(
        function(elm) {
            elm.classList.remove("highlight-legal");
        }
    );
    let moves = this.chess.moves({square: this.selectedSquare});
    let i=0;
    for (let move of moves) {
        moves[i] = move.replace("+","");
        i++;
    }
    this.$square([this.selectedSquare])[0].classList.add("highlight-legal");
    this.$square(moves).
    forEach(
        function(elm) {
            elm.classList.add("highlight-legal");
        }
    );
}
var $enPassant = document.getElementById("en-passant-display");
//var chess = new MainBoard();

async function specialAction(evt = new KeyboardEvent) {
    if (evt.key == " ") {
        $currentSquare = chess.$board.querySelector("[en-passant]");
        $newSquare = chess.$square(chess.hoveredSquare)[0];
        $currentSquare?.removeAttribute("en-passant");
        $newSquare?.setAttribute("en-passant","en-passant");
        $enPassant.innerText = $newSquare?.getAttribute("data-square") ?? "-";
    }
}

function startPosition() {
    // chess.updateFen();
    // chess.started = !chess.started;
}
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

chess2.highlightLegalMoves("red");

chess2.highlightLegalMoves("red","black");

chess2.move("e4");

chess2.unlink(chess1);

chess1.piece("d2").legalMoves();
chess1.piece("d2").moves();

chess1.piece("d2").moves().highlightTo(chess2);

var virutal = chess2
.simulate(function(virtual) {
    virtual.move("Rh4");
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
        }
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
        /**@param {string} e */
        this.move = function(e,{dropped=false}={}) {
            let legal = !!this.#override.move(e.split("-").rekey("from","to"));
            dropped || this.display.move(e,false);
            this.load(`${this.display.fen()} ${this.display.orientation[0]} - - 0 1`);
            if (arguments.length < 3) {
                for (let board of this.linkedBoards) {
                    board.move(e,{dropped:false},false);
                }
            }
            return legal;
        }
        this.highlightLegalMoves = async function(options) {
            await until(async()=>this.display.shadowRoot);
            for (let $square of this.display.shadowRoot.querySelectorAll(".legalSquare")) {
                $square.classList.remove("legalSquare");
                $square.style.filter = "";
            }
            let squares = this.#override.moves(options);
            for (let square of squares) {
                let $square = this.display.shadowRoot.getElementById("square-"+square.slice(-2));
                if($square) {
                    $square.classList.add("legalSquare");
                    $square.style.filter = "grayscale(90%)";
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
                let $pieceRef = this.display.shadowRoot.getElementById("square-"+source);
                /**@type {Array<HTMLImageElement>} */
                let $imgs = [];
                let i=0;
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
                const {newLocation, oldLocation, source} = e.detail;
                for (let board of this.linkedBoards) {
                    let $root = board.display.shadowRoot;
                    $root.getElementById("square-"+oldLocation)?.part?.remove("highlight");
                    $root.getElementById("square-"+newLocation)?.part?.add("highlight");
                    $root.getElementById("square-"+source)?.part?.add("highlight");
                }
            },
            "drop": (e) => {
                const {source, target} = e.detail;
                document.onmousemove = function() {};
                this.move(source+"-"+target);
                this.highlightLegalMoves();
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
                    console.log(board.ascii());
                }
            }
        }
        // display has to be made in the constructor
        this.chessObjectId = document.chess.childElementCount;

        this.display = createElement("chess-board",{
            id:"ChessObject:"+this.chessObjectId,
            style: {
                width:size,
                display:"none",
            },
            addEventListeners: {
                ...action
            }
        });
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

chess1.highlightLegalMoves();