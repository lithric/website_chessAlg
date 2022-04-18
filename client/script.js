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
            moves: this.moves
        }
        this.link = (chessObj) => {
            this.linkedBoards.add(chessObj);
            chessObj.linkedBoards.add(this);
        }
        this.unlink = (chessObj) => {
            this.linkedBoards.delete(chessObj);
            chessObj.linkedBoards.delete(this);
        }
        this.move = function(e) {
            let moveObj = {};
            [moveObj.from,moveObj.to] = e.split("-");
            let legal = this.#override.move(moveObj);
            this.display.move(e);
            //legal ||
            this.load(`${this.display.fen()} ${this.display.orientation()[0]} - - 0 1`);
            if (arguments.length < 2) {
                for (let board of this.linkedBoards) {
                    board.move(e,false);
                }
            }
            return legal;
        }
        this.highlightLegalMoves = function(options) {
            for (let $square of this.$display.getElementsByClassName("legalSquare")) {
                $square.classList.remove("legalSquare");
            }
            let squares = this.#override.moves(options);
            for (let square of squares) {
                let $square = this.$display.getElementsByClassName("square-"+square.slice(-2))[0];
                $square.classList.add("legalSquare");
            }
            if (arguments.length < 2) {
                for (let board of this.linkedBoards) {
                    board.highlightLegalMoves(options,true);
                }
            }
        }
        let action = {
            onDragStart: (source, piece, position, orientation) => {
                let moveX = events.rx[0];
                let moveY = events.ry[0];
                let $pieceRef = this.$display.getElementsByClassName("square-"+source)[0];
                /**@type {Array<HTMLImageElement>} */
                let $imgs = [];
                let i=0;
                for (let board of this.linkedBoards) {
                    //highlight1-32417
                    let $piece = board.$display.getElementsByClassName("square-"+source)[0];
                    $piece?.classList?.add("highlight1-32417");
                    $imgs.push($piece?.getElementsByTagName("img")[0]);
                    if ($imgs.length-1) {
                        $imgs[i].style.transform = `translate(-50%,-50%) translate(${getMousePosFrom($pieceRef).x}px,${getMousePosFrom($pieceRef).y}px)`;
                    }
                    i++;
                }
                document.onmousemove = () => {
                    for (let $img of $imgs) {
                        if ($img) {
                            $img.style.transform = `translate(-50%,-50%) translate(${getMousePosFrom($pieceRef).x}px,${getMousePosFrom($pieceRef).y}px)`;
                            $img.style.position = "relative";
                            $img.style.zIndex = 999;
                        }
                    }
                }
            },
            onDragMove: (newLocation, oldLocation, source, piece, position, orientation) => {
                for (let board of this.linkedBoards) {
                    board.$display.getElementsByClassName("square-"+oldLocation)[0]?.classList?.remove("highlight1-32417");
                    board.$display.getElementsByClassName("square-"+newLocation)[0]?.classList?.add("highlight1-32417");
                    [...this.$display.getElementsByClassName("highlight1-32417")].forEach((elm)=>{
                        board.$display.getElementsByClassName("square-"+elm.getAttribute("data-square"))[0].className = elm.className;
                    });
                }
            },
            onDrop: (source, target, piece, newPos, oldPos, orientation) => {
                document.onmousemove = function() {};
                this.move(source+"-"+target);
                console.log(this.ascii());
                this.highlightLegalMoves();
                for (let board of this.linkedBoards) {
                    [...board.$display.getElementsByClassName("highlight1-32417")].forEach((elm)=>{
                        elm.classList.remove("highlight1-32417");
                    });
                    let $piece = board.$display.getElementsByClassName("square-"+source)[0];
                    if ($piece) {
                        let $img = $piece.getElementsByTagName("img")[0];
                        if ($img) {
                            $img.style.zIndex = 0;
                        }
                    }
                    console.log(board.ascii());
                }
            },
            onMouseoutSquare: (square, piece) => {},
            onMouseoverSquare: (square, piece) => {},
        }
        // display has to be made in the constructor
        this.chessObjectId = 0;
        if (window.document.body.chess) {
            this.chessObjectId = window.document.body.chess.childElementCount;
        }
        else {
            window.document.body.chess = document.body.getElementsByTagName("chess")[0];
        }

        this.$display = document.createElement("div");
        this.$display.className = "chessboard";
        this.$display.id = "ChessObject:"+this.chessObjectId;
        this.$display.style.width = size;
        this.$display.hidden = true;
        document.body.chess.appendChild(this.$display);
        let temp = Chessboard(this.$display,{});
        /**@type {Set<ChessObject>} */
        this.linkedBoards = new Set();
        this.display = {
            ...temp,
            configBuffer: {
                ...action,
                title: title,
                gameNumber: this.chessObjectId,
                gameId: title+":"+this.chessObjectId,
            },
            get config() {
                return this.configBuffer;
            },
            show: ()=>{
                this.$display.show();
            },
            hide: ()=>{
                this.$display.hide();
            }
        }
        Object.defineProperties(this.display,{
                configBuffer: {
                    enumerable: false,
                    writable: true
                },
                config: {
                    set: (prop) => {
                        if (typeof prop === "object") {
                            Object.assign(this.display.configBuffer, prop);
                            Object.assign(this.display,{
                                ...Chessboard(this.$display,this.display.configBuffer),

                            });
                        }
                    }
                }
        })
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

console.log(chess1);
console.log(chess2);

chess1.highlightLegalMoves();