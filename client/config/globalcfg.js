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

var x_0 = Object.getOwnPropertyDescriptors(document.createElement("div"));
console.log(x_0);

/**
 * 
 * @param {string} str 
 * @param {Object} obj
 */
 function createElement(str="div",obj= {}) {
    var elm = document.createElement(str);
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
    for (let key in obj) {
        if(key != "children" && 
        key != "addEventListeners" &&
        key != "setAttributes" &&
        key != "style") {
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

