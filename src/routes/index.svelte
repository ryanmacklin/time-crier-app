<script>
    import { onMount } from 'svelte';
    import Clock from './Clock.svelte';
    import Notifications from './Notifications.svelte';
    import Error from './Error.svelte';

    let innerWidth, innerHeight, outerHeight, outerWidth;

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

    /*** CLOCK/TIME ****/
    let time = new Date();
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

        }, 30000);

        return () => {
            clearInterval(intervalTime);
            clearInterval(intervalConfig);
            clearInterval(intervalChanges);
        };

    });
      
</script>
<svelte:head>
    <title>Time Crier</title>
</svelte:head>
  <svelte:window bind:innerWidth bind:outerWidth bind:innerHeight bind:outerHeight />

<!-- splash screen (TODO make work) -->
<div class="splash">
</div>

<!-- app -->
<div class="app">
    <Clock {time} color={clockColor} height={clockHeight} />
    <!-- FAR FUTURE TODO: weather (current + upcoming) -->
    <div style="clear:both"></div>
    <Notifications primary="Sleep is respecting yourself" secondary="Can you do 5 minutes of exercise soon?"></Notifications>
</div>

<!-- Error -->
<Error />

<style>
    div.splash {
        visibility: hidden;
    }
    div.app {
        visibility: visible;
    }
</style>
