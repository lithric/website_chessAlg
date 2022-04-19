HTMLDivElement.prototype.show = function() {
    this.hidden = false;
}

HTMLDivElement.prototype.hide = function() {
    this.hidden = true;
}

class HTMLChessBodyElement extends HTMLElement {
    constructor() {
        super();
        document.chess = this;
    }
}
customElements.define("chess-body",HTMLChessBodyElement);

class HTMLDebugBodyElement extends HTMLElement {
    constructor() {
        super();
        document.debug = this;
        this.attachShadow({mode: "open"});
        document.addDebug = function(debugId,debugElms) {
            if(!document.debug.shadowRoot.getElementById(debugId)) {
                let $menu = document.createElement("div");
                debugElms.id = debugId;
                document.debug.shadowRoot.appendChild(debugElms);
            }
        }
        document.getDebug = (debugId) => {
            return this.shadowRoot.getElementById(debugId);
        }
    }
}
customElements.define("debug-body",HTMLDebugBodyElement);