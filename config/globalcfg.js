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