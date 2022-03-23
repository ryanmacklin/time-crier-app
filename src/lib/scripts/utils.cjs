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
            end += Time.minutesInDay; // add a day to end only
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
} // end class