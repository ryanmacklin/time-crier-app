import { Time, General } from '$lib/scripts/utils.cjs';

/**** NOTIFICATION COMPILING FUNCTIONS */
// TODO allow for an "enabled: false" option, to skip those entries, so they can live in the file as needed if there's an issue with them
// TODO also a "dev: true" for only run this is dev mode, and "prod: false" for the converse
// but that's down the line

export class NotificationsClass {
    constructor() {
        this.ready = false;
        this.refreshTime = null;
        this.refreshPause = false;

        this.primarySchedule = []; // schedule workspace FOR PRIMARY
        this.primaryNotifications = []; // notifications workspace (for primary and secondary)
        this.primaryNotificationnameIndex = [];// link name to notification array index, without changing inherent priority order we use by iterating on notification (i.e. don't rearrange source collection by name alpha accidentally)    
        this.secondarySchedule = []; // schedule workspace FOR PRIMARY
        this.secondaryNotifications = []; // notifications workspace (for primary and secondary)
        this.secondaryNotificationnameIndex = [];// link name to notification array index, without changing inherent priority order we use by iterating on notification (i.e. don't rearrange source collection by name alpha accidentally)    

        // look-ahead = 3 hours ---- not in scope of this experiment
        // compile = 6 hours
        // that should allow for a relatively sizable internet outage to happen without interruption
        this.startCompile = -2; // 0 minutes from timeBaseline, negative -2 means we're TRYING to look behind current minute
        this.endCompile = 360; // 6 hours (3600 minutes) from timeBaseline
        this.refreshWait = 1; // 5 hours from timeBaseline
    }

    // run this on start/config update
    compileSchedule(config) {
        let primary = this.compileScheduleSection(config.primary);
        this.primarySchedule = primary.schedule;
        this.primaryNotifications = primary.notifications;
        this.primarynameIndex = primary.nameIndex;

        let secondary = this.compileScheduleSection(config.secondary);
        this.secondarySchedule = secondary.schedule;
        this.secondaryNotifications = secondary.notifications;
        this.secondarynameIndex = secondary.nameIndex;

        this.refreshTime = this.newRefreshTime();

        this.ready = true;
        return true; // later, return if it actually works/doesn't error
    }

    newRefreshTime() {
        let d = new Date;
        return new Date(d.setMinutes(d.getMinutes() + this.refreshWait));
    }

    // run this when the schedule needs updating
    updateScheduleCheck() {
        // if we're running out of time, let's do an update
        if ((this.refreshTime !== null) && (this.refreshTime < new Date()) && !this.refreshPause) {
            General.log("Scheduled notification compile")
            this.refreshPause = true; // turn this off for now

            this.doUpdateSchdule();

            
            this.refreshTime = this.newRefreshTime();
            this.refreshPause = false; // ready to start again
        }
    }

    doUpdateSchdule() {
        // start with primary
        let primary = this.updateScheduleSection(this.primaryNotifications, this.primarySchedule);
        if (primary[Time.dayIdOffset(-2)]) {
            // delete this, it's two days old
        }
        let secondary = this.updateScheduleSection(this.secondaryNotifications, this.secondarySchedule);
        if (secondary[Time.dayIdOffset(-2)]) {
            // delete this, it's two days old
        }

        // everything good? then update working stuff
        this.primarySchedule = primary;
        this.secondarySchedule = secondary;
    }

    // run this when you need this moment's notifiations
    get currentNotifications() {
        if (!this.ready) return null;
        return {
            "primary": this.primarySchedule,
            "schedule": this.secondarySchedule
        };
    }
    get currentPrimary() {
        if (!this.ready) return null;
        return this.primarySchedule;
    }
    get currentSecondary() {
        if (!this.ready) return null;
        return this.secondarySchedule;
    }

    // internals
    compileScheduleSection(section) {
        let notifications = []; // notifications workspace (for primary and secondary)
        let nameIndex = [];// link name to notification array index, without changing inherent priority order we use by iterating on notification (i.e. don't rearrange source collection by name alpha accidentally)    

        section.forEach(x => {
            // TODO this should be the other way, where the notifications are already in an index array, and this loops with that index
            // cuz that's how continual compiling should work
            // but this works for the moment
            let index = notifications.length; // *** TODO needs to be made something that can be generated ***
            notifications[index] = x;
            nameIndex[x.name] = index; // link name to index, without changing inherent priority order
        });
        let schedule = this.updateScheduleSection(notifications);

        return {
            "schedule": schedule,
            "notifications": notifications,
            "nameIndex": nameIndex
        };
    }

    updateScheduleSection (wsNotifications, exportSchedule = []) {
        let wsSchedule = []; // schedule workspace
        let time = new Time;
        let thisMinuteOfDay = time.minuteOfDay;
        for (let a = 0; a < wsNotifications.length; a++) {
            let x = wsNotifications[a];
            let tr = time.getTimeRange(x.displayLogic.startTime, x.displayLogic.endTime, thisMinuteOfDay);

            // figure out if this needs to be done
            let doIt = true;
            /* this logic should actualy happen within finding time range
            if (x.displayLogic.dayMonth) { // monthly deal
                // if day of, do it
                // if day before, do it but add a day to all times
                // if day after, do it but subtract a day from all times
                // otherwise, don't do it

                doIt = true; // only if compile time include day of month (negatives counting from end of month)
            } else if (x.displayLogic.dayWeek) {// weekly deal
                // if day of, do it
                // if day before, do it but add a day to all times
                // if day after, do it but subtract a day from all times
                // otherwise, don't do it
                
                doIt = true; // only if compile time includes day of week
            } else { // daily
                // yup, needs to be done
                doIt = true;
            }
            */

            // this generates a larger time slice. we'll narrow down later
            if (doIt) {
                //log("start: " + miltime2minutes(x.displayLogic.startTime) + " || end: " + miltime2minutes(x.displayLogic.endTime));
                // don't bother with looking at variance here; we'll handle that in Notifications
                for (let i = tr.startTime; i <= tr.endTime; i++) {
                    wsSchedule[i] = this.addNotificationToObject(wsSchedule[i], a);
                }
            }

            // here's where we narrow our compiled window down to X hours, and convert it to using day IDs for export
            for (let i = thisMinuteOfDay + this.startCompile; i <= thisMinuteOfDay + this.endCompile; i++) {
                if (wsSchedule[i] != undefined) { // remember 0 is a valid value, as the first record of the array!
                    let d = time.dayIdOffset(Math.floor(i / Time.minutesInDay));
                    let m = i % Time.minutesInDay;
                    if (!Array.isArray(exportSchedule[d])) exportSchedule[d] = [];
                    exportSchedule[d][m] = wsSchedule[i];
                }
            }
        }
        //console.log(exportSchedule);
        return exportSchedule;
    }

    get notificationObject() {
        if (!this.ready) return null;
        return {
            "primary": this.primaryNotifications,
            "secondary": this.secondaryNotifications
        };
        /* let n = [];
        n["primary"] = this.arrayByNames(this.primaryNotifications);
        n["secondary"] = this.arrayByNames(this.secondaryNotifications);
        return n; */
    }

    arrayByNames(ary) { // turn into associated array
        let res = [];
        General.logObject(ary);
        for (let i = 0; i < ary; i++) {
            let name = null; 
            if (General.hasValue(ary[i]["name"])) {
                name = ary[i]["name"];
            }
            if (name != null) {
                res[name] = ary[i];
            }
        }
        return res;
    }

    /*
    getNotificationByName(name) {
        if (name in this.wsNotificationnameIndex) {
            if (this.wsNotificationnameIndex[name] in this.wsNotifications) {
                return this.wsNotifications[this.wsNotificationnameIndex[name]];
            }
        }
        General.log ("Issue: can't find notification by name of \"" + name + "\"");
        return null;
    } */


    // TODO allow for multiple messages by checking to see if obj is a collection that is or isn't empty
    // right now this doesn't care about obj
    addNotificationToObject(obj, note) {
        if (Array.isArray(obj)) { // add to existing array
            let res = obj;
            obj.push(note);
            return res;
        } else if (obj) { // it contains something, let's make it an array now
            return [obj, note];
        } else { // just return note, don't make an array of just one item;
            return note;
        }
    }

    static calculateSpan(notif) {
        let res = [];
        //General.logObject(notif, notif.name);

        // dealing with start/end times; TODO: dealing with day differences? Maybe have that handle this start/end stuff
        let start = Time.miltime2minutes(notif.displayLogic.startTime);
        let end = Time.miltime2minutes(notif.displayLogic.endTime);

        //General.log("start: " + start);
        //General.log("end: " + end);
        /*notif.text = [
            "abc text",
            "rpm text",
            "xyz text",
            "123 text"
        ];*/
        
        if (start > end) end += Time.minutesInDay; // for time loops
        let rand = 15; // TODO: make random start happen; if random start is in the displayLogic
        start += rand; // randomizing

        let text = null;
        let textIter = null;
        if (Array.isArray(notif.text)) {
            // if the text is array, randomize it and start iter
            text = General.shuffleArray(notif.text);
            textIter = 0;
        } else {
            text = notif.text;
        }

        // TODO more complex forms of values, not just 3 sets of ranges
        
        let rands = this.getRandTimeBounds(notif.displayLogic);
        //General.logObject(rands);

        start += General.randIntFromRange(rands.beginLow, rands.beginHigh);
        for (let t = start; t < end; t++) {
            //let m = t % Time.minutesInDay; // let's leave this off for now, might have this happen outside of this func
            
            // add new element
            let e = NotificationsClass.notificationMinuteStruct;
            e.name = notif.name;
            e.id = General.idFromText(e.name);
            //General.log(e.id);

            if (Array.isArray(text)) {
                // TODO iterate to next value; randomize again if out of text, making sure prior text isn't the same as starting text
                if (text.length == textIter && text.length > 2) { // time to loop w/rerandomizing!, unless it's just two entries
                    let last = text[text.length-1];
                    text = General.shuffleArray(notif.text);
                    let lp = 0;
                    while (text[0] == last) {
                        text = General.shuffleArray(notif.text);
                        if (lp++ > 5) { break; } // give up, it's taking too long
                    }
                    textIter = 0;
                } else if (text.length == textIter) { // for two, just loop without re-randomizing
                    textIter = 0;
                }
                e.text = text[textIter++];
                //console.log("[" + (textIter - 1) + "] >> " + e.text);
            } else { // single text
                e.text = text;
            }
            e.transition.mode = null;
            e.transition.type = null;

            // TODO add single/array transition stuff!

            // determine time span
            let span = General.randIntFromRange(rands.lengthLow, rands.lengthHigh); // TODO: make randomizing happen
            // iterate into results here
            for (let i = t; i < t + span; i++) {
                res[i] = e;
            }

            // finally, jump ahead random time
            rand = General.randIntFromRange(rands.pauseLow, rands.pauseHigh); // TODO: make randomizing happen
            t += rand;
        }

       //General.logObject(res);
        return res;
    }

    static getRandTimeBounds(dLogic) {
        let res = {};

        // default
        let defaultShow = "continuous-big"
        let s = dLogic.show.toString() || defaultShow;
        switch (s.toLowerCase()) {
            case "every-minute":
                res.lengthLow = 1;
                res.lengthHigh = 1;
                res.pauseLow = 0;
                res.pauseHigh = 0;
                res.beginLow = 0;
                res.beginHigh = 0;
                break;
            case "continuous":
            case "continuous-big":
                res.lengthLow = 25;
                res.lengthHigh = 30;
                res.pauseLow = 0;
                res.pauseHigh = 0;
                res.beginLow = 0;
                res.beginHigh = 0;
                 break;
            case "contnuous-small":
                res.lengthLow = 5;
                res.lengthHigh = 8;
                res.pauseLow = 0;
                res.pauseHigh = 0;
                res.beginLow = 0;
                res.beginHigh = 0;
                break;
            case "rotation":
            case "rotation-big":
                res.lengthLow = 25;
                res.lengthHigh = 30;
                res.pauseLow = 5;
                res.pauseHigh = 10;
                res.beginLow = 0;
                res.beginHigh = 5;
                break;
            case "rotation-small":
                res.lengthLow = 5;
                res.lengthHigh = 8;
                res.pauseLow = 40;
                res.pauseHigh = 50;
                res.beginLow = 0;
                res.beginHigh = 20;
                break;
            default:
                // WARNING: assume same as default (hardcoded here as continuous-big)
                res.lengthLow = 25;
                res.lengthHigh = 30;
                res.pauseLow = 5;
                res.pauseHigh = 10;
                res.beginLow = 0;
                res.beginHigh = General.inBetween(res.pauseLow, res.pauseHigh);
        }

        if (dLogic.randoms) { // custom values can override any of these
            res.lengthLow = dLogic.randoms.lengthLow || res.lengthLow;
            res.lengthHigh = dLogic.randoms.lengthHigh || res.lengthHigh;
            res.pauseLow = dLogic.randoms.pauseLow || res.pauseLow;
            res.pauseHigh = dLogic.randoms.pauseHigh || res.pauseHigh;
            res.beginLow = dLogic.randoms.beginLow || res.beginLow;
            res.beginHigh = dLogic.randoms.beginHigh || res.beginHigh;
        }

        return res;
    }

    static get notificationMinuteStruct() {
        return {
            "id": "",
            "name": "",
            "text": null,
            "transition": {
                "mode": null,
                "type": null
            }
        };
    }
    
} // end class
