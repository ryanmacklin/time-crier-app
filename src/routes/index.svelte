<script>
    import { onMount } from 'svelte';
    import Clock from './Clock.svelte';
    import Notifications from './Notifications.svelte';

    /**** GET CONFIG ****/
    let config = freshConfig();
    let defaultClockColor = "#FFFFFF";
    let clockColor = defaultClockColor;
    let configFreshness = 0;
    let configLoading = false;
    let configMaxFreshness = 300; // 5 minutes

    function freshConfig() { // a blank config file with just white as the default clock color
        return {
            "updateId": "",
            "clockColors": {
                "default": "",
                "schedule": []
            },
            "notifications": { 
            }
        };
    }

    async function fetchConfig () {
        if (configLoading) {return;} // stop because there's already some attempt at loading (I think?)
        console.log("fetching config file");
        configLoading = true;
        let response = await fetch("./config.json");
        let promise = response.json();
        promise.then(data => {
            if (data.updateId != config.updateId) { // go ahead and load a new config
                console.log("new config file found!");
                let newconfig = freshConfig();
                // updateId
                newconfig.updateId = data.updateId;
                
                // default clock color
                newconfig.clockColors.default = data.clockColors.default || defaultClockColor;
                // calculate clock colors
                //newconfig.clockColors.minutes[1392] = "blue";
                if (data.clockColors.schedule) {
                    newconfig.clockColors.schedule = calculateColorSchedule(data.clockColors.schedule);
                }

                // Okay, we can replace the config now
                config = newconfig;
                configFreshness = configMaxFreshness;
                configLoading = false;
                console.log("config file updated");
            }
        })
        .catch(reason => { // TODO: better UX for when error happens
            console.log(reason.message); // just console.logging the error for now
            configFreshness = 15; // try again in 15 seconds
            configLoading = false;
        });
    }

    function calculateColorSchedule(con) {
        let res = [];
        con.forEach(i => {
            // get times
            // TODO throw error if either time isn't proper military time, in miltime2minutes()
            //let tag = i.tag; // not bothering with tags right now, even though they're in the config as placeholders
            let startTime = miltime2minutes(i.startTime);
            let endTime = miltime2minutes(i.endTime);
            if (endTime < startTime) endTime += 1440; // to handle time spanning midnight
            // start with colors before reading them
            // TODO throw error if either color is invalid, in getColorComponenets()
            // there's either just one color for the time, or a color gradient

            if (i.color) {
                let color = getColorComponenets(i.color); // just to check color
                color = i.color; // if it got here, the color's okay
                for (let i = startTime; i <= endTime; i++) {
                    res[i % 1440] = color;
                }
            } else if (i.startColor && i.endColor) {
                let startColor = getColorComponenets(i.startColor);
                let endColor = getColorComponenets(i.endColor);
                // Math.round(startColor + ( (endColor - startColor) * ((i - startTime) / (endTime - startTime)) ));
                for (let i = startTime; i <= endTime; i++) {
                    let r = Math.round(startColor.r + ( (endColor.r - startColor.r) * ((i - startTime) / (endTime - startTime)) ));
                    let g = Math.round(startColor.g + ( (endColor.r - startColor.g) * ((i - startTime) / (endTime - startTime)) ));
                    let b = Math.round(startColor.b + ( (endColor.r - startColor.b) * ((i - startTime) / (endTime - startTime)) ));
                    let s = "#";
                    s += (r < 16 ? "0" : "") + r.toString(16);
                    s += (g < 16 ? "0" : "") + g.toString(16);
                    s += (b < 16 ? "0" : "") + b.toString(16);
                    res[i % 1440] = s.toUpperCase();
                }
            } else {
                // error!
            }

        });
        console.log(res);
        return res;
    }

    function getColorComponenets(c) {
        // right not this assumes 6-digit hex code (with or without # sign); low-pri todo is maybe not limit to this
        // TODO throw error if either color is invalid
        let r, g, b;

        if (c.substring(0,1) == "#") c = c.substring(1);
        r = Number.parseInt(c.substring(0,2), 16);
        if (Number.isNaN(r)) {} // error!
        g = Number.parseInt(c.substring(2,4), 16);
        if (Number.isNaN(g)) {} // error!
        b = Number.parseInt(c.substring(4,6), 16);
        if (Number.isNaN(b)) {} // error!

        return {"r": r, "g": g, "b": b};
    }

    function miltime2minutes(t) {
            // TODO throw error if either time isn't proper military time
            return (Math.trunc(t / 100) * 60) + (t % 100);
    }

    // config file initial & periodic loading
    onMount(async () => {
          const intervalTime = setInterval(() => {
                if (!configLoading) {
                    if (configFreshness <= 0) {
                        fetchConfig();
                    } else {
                        configFreshness--;
                    }
                }
          }, 1000);
    });

    /*** START TIME ****/
    let time = new Date();
    let hours, minutes, seconds;
    // these automatically update when `time` changes, because of the `$:` prefix
    $: {
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
        clockColor = getClockColor();
    }
    // TODO: there's an issue where when this refreshes, it goes for server time first, then blinks to local time. At least, does when playing in gitpod. I hate that.
    // REAL TODO: let there be a brief loading screen, cuz it takes a couple seconds to do initial config load, so there's some possibly color blipping anyway

    onMount(async () => {
          const intervalTime = setInterval(() => {
              time = new Date();
          }, 1000);
    });

    function curMinute() {
        return (hours * 60) + minutes;
    }

    function getClockColor() {
        // not bothering with tags right now, even though they're in the config as placeholders. so this is pretty simple
        let c = config.clockColors.schedule[curMinute()] || config.clockColors.default || defaultClockColor;
        //console.log(curMinute());
        //console.log(c);
        return c;
    }
    /*********************/

    /**** START NOTIFICATIONS ****/
    let primary = "modulo init: can you do 5 minutes of exercise?", newPrimary;

    onMount(async () => {
        /* const intervalStatus = setInterval(() => {
        let truetime = (hours * 60) + minutes;
        let newPrimary = getStatus(truetime);
        if (newPrimary != "" && newPrimary != primary) primary = newPrimary;
        }, 1000);

        return () => {
            clearInterval(intervalTime);
        }; */
    });
    /*********************/

    function getStatus(truetime) {
        let newStatus = "";
        if (truetime % 10 == 5) {
            newStatus = "modulo 5 last: have you exerised recently?";
        } else if (truetime %10 == 3) {
            newStatus = "modulo 3 last: have you had water recently?";
        } else if (truetime %10 == 8) {
            newStatus = "modulo 8 last: did you take meds today?";
        } else if (truetime %10 == 0) {
            newStatus = "modulo 0 last: have you had sunlight today?";
        }
        return newStatus;
    }
  
      
  </script>
  <svelte:head>
    <title>Time Crier</title>
  </svelte:head>

  <Clock {time} color={clockColor} />
  <!-- FAR FUTURE TODO: weather (current + upcoming) -->
  
<div style="clear:both"></div>

  <Notifications primary="Sleep is respecting yourself" secondary="Can you do 5 minutes of exercise soon?"></Notifications>

  