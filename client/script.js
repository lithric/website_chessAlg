function startPosition() {
    chess1.start();
    console.log(chess1.started);
}
function loadPosition() {
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
        }
        this.started = false;
        this.start = () => {
            this.started = true;
        }
        this.stop = () => {
            this.started = false;
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
        this.load = async function(oldFen) {
            let curFen = ()=>`${this.display.fen()} ${this.display.orientation[0]} - - 0 1`;
            // wait until the string updates
            await until(()=>oldFen!=curFen(),10,3);
            this.#override.load(curFen());
        }
        async function* bob() {
            yield 1;
            await sleep(100);
            yield 5;
        }
        /**
         * @param {string} e
         * @returns 
         */
        this.move = async function*(e,{dropped=false}={}) {
            let legal = !!this.#override.move(e.split("-").rekey("from","to"));
            if(this.started) {
                legal && this.display.move(e,false);
            }
            else {
                dropped || this.display.move(e,false);
            }
            yield legal;
            await this.load(`${this.display.fen()} ${this.display.orientation[0]} - - 0 1`);
            if (arguments.length < 3) {
                for (let board of this.linkedBoards) {
                    await board.move(e,{dropped:false},false).next();
                }
            }
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
            console.log(squares);
            let debug = document.getDebug("pieceControl");
            console.log(pieceMoves("K",debug.value));
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
            "drop": async(e) => {
                const {source, target, setAction} = e.detail;
                document.onmousemove = function() {};
                let moveGen = this.move(source+"-"+target);
                let legalMove = await moveGen.next();
                if(this.started && !legalMove.value) {
                    setAction("snapback");
                }
                await moveGen.next();
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

chess1.highlightLegalMoves();