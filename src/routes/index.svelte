<script lang='ts'>
    let error = null; 

    import { onMount } from 'svelte';

    import Clock from '$lib/components/Clock.svelte';
    import Notifications from '$lib/components/Notifications.svelte';
    import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';

    // *** ADD THIS
    const minutesInDay = 1440;
    const secondsInDay = 86400;

    let innerWidth, innerHeight, outerHeight, outerWidth;

    // loading screen stuff
    let showLoadingScreen = true;
    let loadingStyles = {
        'splash-opacity': "1",
        'splash-display': 'block',
        'core-opacity': "0",
        'core-display': 'none',
    };
    let cssVarLoading = "";
    let loadingTime = 1; // in seconds
    $: cssVarLoading = Object.entries(loadingStyles)
        .map(([key, value]) => `--${key}:${value}`)
        .join(';');

    /**** log ****/
    function log(message) {
        console.log("[" + time.toLocaleString() + "]  " + message);
    }

    /**** GET CONFIG ****/
    let config = freshConfig();
    let defaultClockColor = "#FFFFFF";
    let clockColor;
    $: clockColor = defaultClockColor;
    let configFreshness = 0;
    let configLoading = false;
    let configMaxFreshness = 10; // 300 seconds/5 minutes for live; TODO can we make it happen more often in dev?
    let configMalloadCount = 0;
    let newconfig;

    function freshConfig() { // a blank config file with just white as the default clock color
        return {
            "updateId": "",
            "colorPresets": {},
            "clockColors": {
                "default": "",
                "schedule": []
            },
            "notifications": {
                "logic": {}, 
                "schedule": []
            }
        };
    }

    async function fetchConfig () {
        if (configLoading) {return;} // stop because there's already some attempt at loading (I think?)
        log("fetching config file");
        configLoading = true;
        let response = await fetch("./config.json");
        let promise = response.json();
        promise.then(data => {
            if (data.updateId != config.updateId) { // go ahead and load a new config
                log("new config file found!");
                newconfig = freshConfig();
                // updateId
                newconfig.updateId = data.updateId;

                // colorPresets
                newconfig.colorPresets = data.colorPresets;
                
                // default clock color
                newconfig.clockColors.default = data.clockColors.default || defaultClockColor;
                // calculate clock colors
                //newconfig.clockColors.minutes[1392] = "blue";
                if (data.clockColors.schedule) {
                    newconfig.clockColors.schedule = calculateColorSchedule(data.clockColors.schedule);
                }

                // assign notification logic & compile upcoming time
                if (data.notifications) {
                    newconfig.notifications.logic = data.notifications;
                }

                // Okay, we can replace the config now
                config = newconfig;
                configFreshness = configMaxFreshness;
                configMalloadCount = 0;
                configLoading = false;
                // And set the color now
                clockColor = getClockColor();
                log("config file updated");
            } else {
                log("no updated needed");
                configFreshness = configMaxFreshness;
                configMalloadCount = 0;
                configLoading = false;
            }
        })
        .catch(reason => { // TODO: better UX for when error happens
            configMalloadCount++;
            let m = reason.message;
            m = "Config file: " + reason.message + " (" + configMalloadCount + " failed load) [" + time.toLocaleString() + "]";
            console.error(m);
            //errorMessage = m;
            configFreshness = 15; // try again in 15 seconds
            configLoading = false;
        });
    }

    function calculateColorSchedule(con) {
        let res = [];
        con.forEach(i => {
            // get times
            let tag = i.tag || ""; // not bothering with tags right now, even though they're in the config as placeholders, but they're useful in debugging
            //console.log(tag);

            let startTime = miltime2minutes(i.startTime);
            let endTime = miltime2minutes(i.endTime);
            if (endTime < startTime) endTime += 1440; // to handle time spanning midnight

            if (i.color) {
                let color = getColorComponenets(i.color); // just to check color
                color = i.color; // if it got here, the color's okay
                for (let i = startTime; i <= endTime; i++) {
                    res[i % 1440] = getColor(color, newconfig);
                }
            } else if (i.startColor && i.endColor) {
                let startColor = getColorComponenets(getColor(i.startColor, newconfig));
                let endColor = getColorComponenets(getColor(i.endColor, newconfig));
                for (let i = startTime; i <= endTime; i++) {
                    let r = Math.round(startColor.r + ( (endColor.r - startColor.r) * ((i - startTime) / (endTime - startTime)) ));
                    let g = Math.round(startColor.g + ( (endColor.g - startColor.g) * ((i - startTime) / (endTime - startTime)) ));
                    let b = Math.round(startColor.b + ( (endColor.b - startColor.b) * ((i - startTime) / (endTime - startTime)) ));
                    let s = "#";
                    s += (r < 16 ? "0" : "") + r.toString(16);
                    s += (g < 16 ? "0" : "") + g.toString(16);
                    s += (b < 16 ? "0" : "") + b.toString(16);
                    res[i % 1440] = s.toUpperCase();
                }
            } else {
                throw "Invalid color schedule entry for tag \"" + tag + "\"";
                // error!
            }
        });
        //console.log(res);
        return res;
    }

    // color calc functions
    function getColor(x, col = config) {
        // TODO handle error!
        if (x.substring(0,1) == "%") {
            x = x.substring(1);
            if (x == "default") {
                return col.clockColors.default;
            } else {
                try {
                    return col.colorPresets[x];
                }
                catch {
                    throw '"' + x + "\" isn't a listed preset color";
                }
            }
        }
        return x; // doesn't need transation
    }
    function getColorComponenets(x) {
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

    // time calc functions
    function miltime2minutes(t) {
        if (!Number.isInteger(t)) {throw '"' + t.toString() + "\" isn't a valid military time";} // error!
        let hours = Math.trunc(t / 100);
        let minutes = t % 100;
        if (hours > 23 || hours < 0) {throw '"' + t.toString() + "\" isn't a valid military time";} // error!
        if (minutes > 59 || minutes < 0) {throw '"' + t.toString() + "\" isn't a valid military time";} // error!
        return (Math.trunc(t / 100) * 60) + (t % 100);
    }
    function curTime(baseline = timeBaseline) { // current time in truncated seconds, subtracting baseline to keep arrays from being whack
        return Math.floor((time.getTime() - baseline) / 1000);
    }
    
    /**** NOTIFICATION COMPILING FUNCTIONS */
    // TODO change "tag" to "name"
    // TODO allow for an "enabled: false" option, to skip those entries, so they can live in the file as needed if there's an issue with them
    // TODO also a "dev: true" for only run this is dev mode, and "prod: false" for the converse
    // but that's down the line
    function getDayId(offset = 0) {
        let date = new Date(time);
        if (offset != 0) date.setDate(date.getDate() + offset);
        let month = date.getMonth();
        let day = date.getDate();
        return (month * 40) + day;
    }
    function findTimeRange(startTimeMil, endTimeMil, current = curMinuteOfDay()) {
        let start = miltime2minutes(startTimeMil);
        let end = miltime2minutes(endTimeMil);
        let tomorrow = false; // quick flag so other functions can just do a bool test on if we had to add a day

        if (end < start) { // schedule start/end spans day boundary
        if ((start <= current) || (end >= current)) { // is during
            end += minutesInDay; // add a day to end only
            } else { // is upcoming tomorrow
                start += minutesInDay;
                end += minutesInDay;
                tomorrow = true;
            }
        } else { // schedule start/end on same day
            if ((start <= current) && (end >= current)) { // is during
            // no math
            } else { // is upcoming tomorrow
                start += minutesInDay;
                end += minutesInDay;
                tomorrow = true;
            }
        }
        // finally, if end is before start, move it forward
        if (end < start) {
            end += minutesInDay;
        }
        return {"startTime": start, "endTime": end, "tomorrow": tomorrow}
    }
    // just for easy logging purposes, going from miltime to minutes (accounting for single day)
    function miltime4minutes(t) {
        let s = "0000";
        let i = false;
        if (t > minutesInDay) {
            i = true;
            t -= minutesInDay;
        }
        s = s + ((Math.trunc(t / 60) * 100) + (t % 60) ).toString();
        s = s.slice(-4);
        return (t < 0 ? "-" : "") + (i ? "1day+" : "") +  s;
    }
    let wsSchedule = []; // schedule workspace FOR PRIMARY
    let wsNotifications = []; // notifications workspace (for primary and secondary)
    let wsNotificationTagIndex = [];// link tag to notification array index, without changing inherent priority order we use by iterating on notification (i.e. don't rearrange source collection by tag alpha accidentally)

    function compileNotificationSchedule(conf) {
        let schedule = [];
        let thisMinuteOfDay = curMinuteOfDay();

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

            let tr = findTimeRange(x.displayLogic.startTime, x.displayLogic.endTime, thisMinuteOfDay);

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
                    let d = getDayId(Math.floor(i / minutesInDay));
                    let m = i % minutesInDay;
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



    /*** CLOCK/TIME ****/
    let time = new Date();
    let timeBaseline = time.getTime();
    let hours, minutes, seconds;
    // these automatically update when `time` changes, because of the `$:` prefix
    $: {
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
        clockColor = getClockColor();
    }
  
    // rudimentary setting of clock height
    let clockHeight = 250;
    $: clockHeight = ( (innerHeight / 2.5) > 250) ? (innerHeight / 2.5) : 250;

    // TODO: there's an issue where when this refreshes, it goes for server time first, then blinks to local time. At least, does when playing in gitpod. I hate that.
    // REAL TODO: let there be a brief loading screen, cuz it takes a couple seconds to do initial config load, so there's some possibly color blipping anyway

    function curMinuteOfDay() {
        return (hours * 60) + minutes;
    }
    function curTimeMinute(baseline = timeBaseline) {
        return Math.floor(curTime(timeBaseline) / 60);
    }

    function getClockColor() {
        // not bothering with tags right now, even though they're in the config as placeholders. so this is pretty simple
        let c = config.clockColors.schedule[curMinuteOfDay()] || config.clockColors.default || defaultClockColor;
        //console.log(curMinuteOfDay());
        //console.log(c);
        return c;
    }

    /**** NOTIFICATIONS ****/

    /*** ONMOUNT ***/
    onMount(async () => {
        log("Starting app");
        // TODO can we identify if we're on dev or prod, and change variables/visibility if on dev?

        // start time + clock color poll
         const intervalTime = setInterval(() => {
            time = new Date();
            clockColor = getClockColor();
         }, 1000);
         // config file
         const intervalConfig = setInterval(() => {
                if (!configLoading) {
                    if (configFreshness <= 0) {
                        fetchConfig();
                    } else {
                        configFreshness--;
                    }
                    //console.log("freshness: " + configFreshness.toString());
                }
          }, 1000);
        // notifications
        const intervalChanges = setInterval(() => {

        }, 1000);

        // finally, take loading screen off after [loadingTime] seconds
        setTimeout(async function() {
            function sleep(ms: number) {
               return new Promise(resolve => setTimeout(resolve, ms));
            }
            let divis = 1 / 50;
            let pause = 15;
            // fade out loading
            let p = 1;
            while (p >= 0.2) {
                loadingStyles["splash-opacity"] = p.toString();
                p -= divis;
                await sleep(pause);
            }
            loadingStyles["splash-opacity"] = "0";
            loadingStyles["splash-display"] = "none";
            // fade in core
            loadingStyles["core-display"] = "block";
            p = 0.2;
            while (p <= 1) {
                loadingStyles["core-opacity"] = p.toString();
                p += divis;
                showLoadingScreen = (p < 0.8); // consider the loading screen ready for execution at 80%
                await sleep(pause);
            }
            loadingStyles["core-opacity"] = "1";
            loadingStyles["core-display"] = "block";
            error = new Error('blah');
        }, loadingTime * 1000);

        return () => {
            clearInterval(intervalTime);
            clearInterval(intervalConfig);
            clearInterval(intervalChanges);
        };
    });

    let notificationPrimary = null;
    // TEMP CODE just to load a notification in regardless of time
    $: {
        if (!showLoadingScreen) {
            try {
                notificationPrimary = config.notifications.logic.primary[0];
            } catch {
                // nothing
            }
        }
    };
</script>
<svelte:head>
    <title>Time Crier</title>
</svelte:head>
<svelte:window bind:innerWidth bind:outerWidth bind:innerHeight bind:outerHeight />
<div class="all" style="{cssVarLoading}">
<!-- splash screen (TODO make work) -->
<div class="splash">
        loading!
</div>

<!-- app -->
<div class="core" >
    <Clock {time} color={clockColor} height={clockHeight} />
    <!-- FAR FUTURE TODO: weather (current + upcoming) -->
    <div style="clear:both"></div>
    <Notifications primary={notificationPrimary} secondary="Can you do 5 minutes of exercise soon?"></Notifications>
    <!--<Notifications primary="[static] Sleep is respecting yourself" secondary="Can you do 5 minutes of exercise soon?"></Notifications>-->
</div>

<!-- Error -->
<ErrorDisplay bind:error />
</div>
<style>
    div.splash {
        display: var(--splash-display, "block");
        opacity: var(--splash-opacity, "1");

        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        font-size: 10rem;
        text-align: center;
        margin-top: 2em;
    }
    div.core {
        display: var(--core-display, "none");
        opacity: var(--core-opacity, "0");
    }
</style>
