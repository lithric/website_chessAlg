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
        /**
         * 
         * @param {string} debugId 
         * @param {HTMLElement} debugElm 
         */
        document.addDebug = function(debugId) {
            if(!document.debug.shadowRoot.getElementById(debugId)) {
                var $menu = document.createElement("div");
                $menu.id = debugId;
                for (let debugElm of [...arguments].slice(1)) {
                    $menu.appendChild(debugElm);
                    if(!$menu.value) {
                        $menu.value = debugElm.value;
                    }
                    else if($menu.value.constructor !== Object) {
                        let debugKey = debugElm.name;
                        $menu.value = {[$menu.firstChild.name]:$menu.value};
                        $menu.value[debugKey] = debugElm.value;
                    }
                    else {
                        $menu.value[debugElm.name] = debugElm.value;
                    }
                    debugElm.addEventListener("input",function() {
                        let $menu = document.debug.shadowRoot.getElementById(debugId);
                        if($menu.value.constructor !== Object) {
                            $menu.value = this.value;
                        }
                        else {
                            $menu.value[this.name] = this.value;
                        }
                    });
                    document.debug.shadowRoot.appendChild($menu);
                }
            }
        }
        document.getDebug = (debugId) => {
            var $menu = this.shadowRoot.getElementById(debugId);
            var returnValue = $menu;
            if ($menu.value.constructor === Object) {
                returnValue = {value:$menu.value};
                for (let key in $menu.value) {
                    Object.defineProperties(returnValue,{
                        [key]: {
                            get:()=>{
                                return $menu.value[key];
                            }
                        }
                    })
                }
            }
            return returnValue;
        }
    }
}
customElements.define("debug-body",HTMLDebugBodyElement);