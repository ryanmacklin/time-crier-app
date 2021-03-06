export class Time {
    static minutesInDay = 1440;
    static secondsInDay = 86400;

    constructor() {
        this._time = new Date();
        this._timeBaseline = this._time.getTime();
        /* async () => { // the async doesn't work inside this
             const intervalTime = setInterval(() => {
                this._time = new Date();
             }, 1000);
             return () => {
                clearInterval(intervalTime);
             }
        } */
    }

    // current time gets
    get now() {return this._time};
    get timeStart() {return this._timeBaseline};
    get hours() {return this._time.getHours();}
    get minutes() {return this._time.getMinutes();}
    get seconds() {return this._time.getSeconds();}
    get timestamp() {return this._time.getTime();}
    get timestampInSeconds() {return Math.floor(this.timestamp / 1000);}

    tick() {
        this._time = new Date();
        return this._time;
    }
    setTime(date) {
        this._time = date;
        return this._time;
    }

    static minuteOfDay() { // was "curMinutesOfDay"
        return (new Time).minuteOfDay;
    }
    get minuteOfDay() { // was "curMinutesOfDay"
        return (this.hours * 60) + this.minutes;
    }
    get secondsFromStart() {return this.secondsFromBaseline()}; // in seconds, was was "curTime"
    secondsFromBaseline(baseline = this._timeBaseline) { // current time in truncated seconds, subtracting baseline to keep arrays from being whack
        return Math.floor((this._time.getTime() - baseline) / 1000);
    }
    get minutesFromStart() {return this.minutesFromBaseline()}
    minutesFromBaseline(baseline = this._timeBaseline) {
        return Math.floor(this.secondsFromBaseline(baseline) / 60);
    }

    static get clockDigitsStruct() {
        let res = {
            "h1": "",
            "h2": "",
            "m1": "",
            "m2": "",
            "s1": "",
            "s2": "",
            "pm": false
        }
        return res;
    }
    get clockDigits() {
        let res = Time.clockDigitsStruct;
        let hour;
        if (this.hours > 12) {
            hour = this.hours - 12;
            res.pm = true;
        } else if (this.hours == 0) {
            hour = 12;
            res.pm = false;
        } else {
            hour = this.hours;
            res.pm = false;
        }
        res.h1 = (hour / 10).toString().substring(0,1);
        if (res.h1 == "0") res.h1 = ""; // use " " if I ever want it to take up the same amount of space
        res.h2 = (hour % 10).toString();
        res.m1 = (this.minutes / 10).toString().substring(0,1);
        res.m2 = (this.minutes % 10).toString();
        res.s1 = (this.seconds / 10).toString().substring(0,1);
        res.s2 = (this.seconds % 10).toString();
        return res;
    }

    // warning: dayId is technically messy, just to create unique rotating IDs for each day
    // static one is based on current time, not stored time
    static get dayId() {return Time.dayIdOffset()}
    static dayIdOffset(offset = 0) { // was getDayId
        let date = new Date();
        if (offset != 0) date.setDate(date.getDate() + offset);
        let month = date.getMonth();
        let day = date.getDate();
        return (month * 40) + day;
    }
    get dayId() {return this.dayIdOffset()}
    dayIdOffset(offset = 0) { // was getDayId
        let date = new Date(this._time);
        if (offset != 0) date.setDate(date.getDate() + offset);
        let month = date.getMonth();
        let day = date.getDate();
        return (month * 40) + day;
    }

    // static calc functions
    static miltime2minutes(t) {
        if (!Number.isInteger(t)) {throw '"' + t.toString() + "\" isn't a valid military time";} // error!
        let hours = Math.trunc(t / 100);
        let minutes = t % 100;
        if (hours > 23 || hours < 0) {throw '"' + t.toString() + "\" isn't a valid military time";} // error!
        if (minutes > 59 || minutes < 0) {throw '"' + t.toString() + "\" isn't a valid military time";} // error!
        return (Math.trunc(t / 100) * 60) + (t % 100);
    }
    // just for easy logging purposes, going from miltime to minutes (accounting for single day)
    static miltime4minutes(t) {
        let s = "0000";
        let i = false;
        if (t > this.minutesInDay) {
            i = true;
            t -= this.minutesInDay;
        }
        s = s + ((Math.trunc(t / 60) * 100) + (t % 60) ).toString();
        s = s.slice(-4);
        return (t < 0 ? "-" : "") + (i ? "1day+" : "") +  s;
    }

    getTimeRange(startTimeMil, endTimeMil, current = this.minuteOfDay) { // was findTimeRange
        let start = Time.miltime2minutes(startTimeMil);
        let end = Time.miltime2minutes(endTimeMil);
        let tomorrow = false; // quick flag so other functions can just do a bool test on if we had to add a day

        if (end < start) { // schedule start/end spans day boundary
            if ((start <= current) || (end >= current)) { // is during
// TODO THIS IS IMPORTANT, IT'S EITHER EARLY IN DAY AND START SHOULD BE 0, OR END OF DAY AND END SHOULD BE +1440
// I THINK THIS IS RIGHT
                start = 0; // start is beginning of time, aka 0
            } else { // is upcoming tomorrow
                start += Time.minutesInDay;
                end += Time.minutesInDay;
                tomorrow = true;
            }
        } else { // schedule start/end on same day
            if ((start <= current) && (end >= current)) { // is during
            // no math
            } else { // is upcoming tomorrow
                start += Time.minutesInDay;
                end += Time.minutesInDay;
                tomorrow = true;
            }
        }
        // finally, if end is before start, move it forward
        if (end < start) {
            end += Time.minutesInDay;
        }
        return {"startTime": start, "endTime": end, "tomorrow": tomorrow}
    }

} // end class

export class General {
    static getColorComponenets(x) {
        // this assumes 6-digit hex code (with or without # sign)
        let r, g, b;
        let c = x;
        if (c.substring(0,1) == "#") c = c.substring(1);
        r = Number.parseInt(c.substring(0,2), 16);
        if (Number.isNaN(r)) {
            console.log("---" + x);
        }
        if (Number.isNaN(r)) {} //throw '"' + x + "\" isn't a valid color code";} // error!
        g = Number.parseInt(c.substring(2,4), 16);
        if (Number.isNaN(g)) {} //throw '"' + x + "\" isn't a valid color code";} // error!
        b = Number.parseInt(c.substring(4,6), 16);
        if (Number.isNaN(b)) {} //throw '"' + x + "\" isn't a valid color code";} // error!
        return {"r": r, "g": g, "b": b};
    }

    static log(message) {
        console.log("[" + (new Date).toLocaleString() + "]  " + message);
    }

    static logObject(message, name = "") {
        console.log("=====" + (name != "" ? (" " + name + " =====") : "====="));
        console.log(message);
        console.log("=".repeat(name.length > 0 ? 12 + name.length : 10));
    }

    static isReal(obj = undefined) {
        try {
            if (obj === undefined) return false;
            if (obj === null || obj == 0 || obj == "") return false;
            if (this.isIterable(obj) && obj.length == 0) return false;
        } catch {
            return false;
        }
        return true;
    }

    static isFilledArray(ary) {
        if (!this.isIterable(ary)) return false;
        return (ary.length > 0);
    }

    static isIterable(obj) {
        if (obj == null || obj == undefined) return false;
        //console.log("sup! == " + (typeof obj[Symbol.iterator] === 'function'));
        return (typeof obj[Symbol.iterator] === 'function');
    }

    static shuffleArray(ary) {
        let res = ary;
        res.sort(() => Math.random() - 0.5);
        return res;
    }
    
    static randInt(cap = 10) { // number from 0 to cap-1
        return Math.floor(Math.random() * cap);
    }
    
    static randIntFromRange(start = 0, end = 10) { // number from start to cap (not cap-1)
        return start + this.randInt(end - start + 1);
    }

    static idFromText(text = "") {
        let res = (text.toLowerCase().replaceAll('/[^a-z]', "") + "0000").substring(0, 3);
        let n = "" + this.randInt(10000);
        res = res + (n.length < 4 ? "0".replace(n.length - 4) : "") + n;
        return res;
    }

    static inBetween(a = 0, b = 0) {
        let x = a;
        let y = b;
        if (x > y) { x = b; y = a; } // reverse if needed
        return x + Math.floor((y - x) / 2);
    }

} // end class