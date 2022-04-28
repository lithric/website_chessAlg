/**
 * 
 * @typedef {import("benchmark").Suite} Suite
 */

/**
 * @param {Number} ms milliseconds the current thread will stop for
 */
function sleep(ms,res) {
    return new Promise((resolve) => {return setTimeout(()=>{resolve(res)},ms)});
}

/**
 * 
 * @param {function(): Promise<boolean>} cond a function that will eventually return a boolean after some amount of time
 * @param {number} timeout the allowed time for the condition to be true
 * @param {number} checks the amount of times the condition is checked before timeout
 * @returns {Promise<boolean>} if the condition was met before timeout
 */
 async function until(cond,timeout=3000,checks=30) {
    var passed = false;
    var timedOut = false;
    setTimeout(()=>{timedOut = true},timeout);
    while(true) {
        passed = await cond();
        if (passed || timedOut) {
            break;
        }
        await sleep(Math.ceil(timeout/checks));
    }
    return passed;
}

class Calc extends Array {
    constructor() {
        super(length);
        this.push(arguments[0]);
        this.past = [];
        this.future = [];
        this.undoLimit = 5;
    }
    /**
     * @description replaces the current value of Calc iff the new value is
     * not equal to the current value. Else, it replaces the current value with null.
     * @param {*} obj object to induct into the current value of Calc.
     * @returns new value of Calc.
     */
    induct(obj) {
        this.future = [];
        this.past.unshift(this[0]) > this.undoLimit &&
        this.past.pop();
        if (this[0] == null) {
            this[0] = obj;
        }
        else if(!_.isEqual(this[0],obj)) {
            this[0] = obj;
        }
        else {
            this[0] = null;
        }
        return this;
    }
    /**
     * @description undos the current value to the previously held value.
     * @returns the amount left to undo. if undo fails, it returns null.
     */
    undo() {
        if(this.past.length) {
            this.future.unshift(this[0]);
            this[0] = this.past[0];
            this.past.shift();
            return this.past.length;
        }
        else {
            console.error("undo limit reached");
            return null;
        }
    }
    /**
     * @description redos the current value to the value that was previously undone.
     * @returns amount left to redo. if redo fails, it returns null.
     */
    redo() {
        if(this.future.length) {
            this.past.unshift(this[0]);
            this[0] = this.future[0];
            this.future.shift();
            return this.future.length;
        }
        else {
            console.error("redo limit reached");
            return null;
        }
    }
    /**
     * @description assigns evaluated expression to the current value of Calc.
     * @param {*} expr expression to evaluate.
     */
    assign(expr) {
        this.future = [];
        this.past.unshift(this[0]) > this.undoLimit &&
        this.past.pop();
        this[0] = expr;
    }
}

export{Calc,sleep,until};

// await condA.unless(()=>{condB()})()