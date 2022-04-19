HTMLDivElement.prototype.show = function() {
    this.hidden = false;
}

HTMLDivElement.prototype.hide = function() {
    this.hidden = true;
}

class HTMLChessElement extends HTMLElement {
    constructor() {
        super();
        document.chess = this;
    }
}
customElements.define("chess-body",HTMLChessElement);