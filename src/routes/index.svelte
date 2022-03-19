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
                "minutes": []
            },
            "notifications": { 
            }
        };
    }

    async function fetchConfig () {
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
                if (newconfig.clockColors.schedule) {
                    calculateColorSchedule(newconfig.clockColors.schedule);
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
        con.foreach(i => {
            // get times
            // TODO throw error if either time isn't proper military time (see miltime2minutes())
            let startTime = miltime2minutes(i.startTime);
            let endTime = miltime2minutes(i.endTime);
            if (endTime < startTime) endTime += 1440; // to handle time spanning midnight
            // start with colors before reading them
            // TODO throw error if either color is invalid
            let startColorR = -1;
            let startColorG = -1;
            let startColorB = -1;
            let endColorR = -1;
            let endColorG = -1;
            let endColorB = -1;


        });
        return res;
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

    function getClockColor() {
        let c = config.clockColors.minutes[(hours * 60) + minutes] || config.clockColors.default || defaultClockColor;
        console.log((hours * 60) + minutes);
        console.log(c);
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

  