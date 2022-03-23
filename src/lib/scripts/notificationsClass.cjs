    /**** NOTIFICATION COMPILING FUNCTIONS */
    // TODO change "tag" to "name"
    // TODO allow for an "enabled: false" option, to skip those entries, so they can live in the file as needed if there's an issue with them
    // TODO also a "dev: true" for only run this is dev mode, and "prod: false" for the converse
    // but that's down the line

    let wsSchedule = []; // schedule workspace FOR PRIMARY
    let wsNotifications = []; // notifications workspace (for primary and secondary)
    let wsNotificationTagIndex = [];// link tag to notification array index, without changing inherent priority order we use by iterating on notification (i.e. don't rearrange source collection by tag alpha accidentally)

    function compileNotificationSchedule(conf) {
        let schedule = [];
        let thisMinuteOfDay = time.minuteOfDay;

        // look-ahead = 3 hours ---- not in scope of this experiment
        // compile = 6 hours
        // that should allow for a relatively sizable internet outage to happen without interruption
        let startCompile = 0; // 0 minutes from timeBaseline
        let endCompile = 360; // 6 hours (3600 minutes) from timeBaseline

        let exportSchedule = [];

        conf.forEach(x => {
            console.log(x);

            // TODO this should be the other way, where the notifications are already in an index array, and this loops with that index
            // cuz that's how continual compiling should work
            // but this works for the moment
            let index = wsNotifications.length; // *** TODO needs to be made something that can be generated ***
            wsNotifications[index] = x;
            wsNotificationTagIndex[x.tag] = index; // link tag to index, without changing inherent priority order

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
                    wsSchedule[i] = addNotificationToObject(wsSchedule[i], index);
                }
            }

            // here's where we narrow our compiled window down to X hours, and convert it to using day IDs for export
            for (let i = thisMinuteOfDay + startCompile; i <= thisMinuteOfDay + endCompile; i++) {
                if (wsSchedule[i]) {
                    let d = time.dayIdOffset(Math.floor(i / Time.minutesInDay));
                    let m = i % Time.minutesInDay;
                    if (!Array.isArray(exportSchedule[d])) exportSchedule[d] = [];
                    exportSchedule[d][m] = wsSchedule[i];
                }
            }

            // schedule ready for export now
            console.log(getNotificationByName("sleep"));
        });
    }

    function getNotificationByName(name) {
        if (name in wsNotificationTagIndex) {
            if (wsNotificationTagIndex[name] in wsNotifications) {
                return wsNotifications[wsNotificationTagIndex[name]];
            }
        }
        log ("Issue: can't find notification by name of \"" + name + "\"");
        return null;
    }


        // TODO allow for multiple messages by checking to see if obj is a collection that is or isn't empty
        // right now this doesn't care about obj
    function addNotificationToObject(obj, note) {
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

