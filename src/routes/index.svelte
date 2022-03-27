<script lang='ts'>
    let error = null; 

    import { onMount } from 'svelte';

    import Clock from '$lib/components/Clock.svelte';
    import Notifications from '$lib/components/Notifications.svelte';
    import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
    import { Time, General } from '$lib/scripts/utils.cjs';
    import { Config } from '$lib/scripts/configLoad.cjs';
    import { ClockClass } from '$lib/scripts/clockClass.cjs';
    import { NotificationsClass } from '$lib/scripts/notificationsClass.cjs';

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
    let loadingScreenTimeout = 0.5; // in seconds
    $: cssVarLoading = General.makeCssString(loadingStyles);


    let config = new Config;
    // notification bigs
    let nProcessor = new NotificationsClass;
    let nCollection = { "primary": [], "secondary": [] };

    /*** CLOCK/TIME ****/
    let clockColor = ClockClass.defaultColor;
    let activePrimary = [];
    let activeSecondary = [];
    let time = new Time();  
    // rudimentary setting of clock height
    let clockHeight = 250;
    $: clockHeight = ( (innerHeight / 2.5) > 250) ? (innerHeight / 2.5) : 250;

    /**** POLLING ****/

    function update() {
        config.fetchIfStale();
    }
    function tick() {
        time._time = time.tick(); // warning: this is hacky way to make the time update
        clockColor = config.currentClockColor(time.minuteOfDay); // is in top
    }

    /*** ONMOUNT ***/
    onMount(async () => {
        General.log("Starting app");
        // TODO can we identify if we're on dev or prod, and change variables/visibility if on dev?
        // initialize to not wait for polling
        tick();
        update();

        // start polling
         const intervalTime = setInterval(() => {
             tick();
         }, 1000);
         // config file
         const intervalConfig = setInterval(() => {
            update();
            //console.log(config.freshnessCount);
            if (config.updateNotifications) {
                config.updateNotifications = false;
                let nCol = [];
                nProcessor.compileSchedule(config.data.notifications);
                nCollection = nProcessor.notificationObject;
                //nCollection = nProcessor.notificationArray;
                //General.logObject(nCollection, "nCollection");
            }
            if (nProcessor.ready) {
                // TODO fix inconsistency on whether current minute is loaded in or not
                //console.log(nProcessor.currentPrimary);
                try {
                    activePrimary = nProcessor.currentPrimary[time.dayId][time.minuteOfDay];
                    if (activePrimary == undefined) activePrimary = null;
                } catch {
                    activePrimary = null;
                }
            }
          }, 1000);
        // notifications
        const intervalUpdates = setInterval(() => {
            nProcessor.updateScheduleCheck();
        }, 60000);

        // finally, take loading screen off after [loadingTime] seconds
        if (loadingScreenTimeout == 0) {
            loadingStyles = {
                'splash-opacity': "0",
                'splash-display': 'none',
                'core-opacity': "1",
                'core-display': 'block',
            };
            return;
        } else {
            setTimeout(async function() {
                let divis = 1 / 50;
                let pause = 15;
                // fade out loading
                let p = 1;
                while (p >= 0.2) {
                    loadingStyles["splash-opacity"] = p.toString();
                    p -= divis;
                    await General.sleep(pause);
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
                    await General.sleep(pause);
                }
                loadingStyles["core-opacity"] = "1";
                loadingStyles["core-display"] = "block";
            }, loadingScreenTimeout * 1000);
        }

        return () => {
            clearInterval(intervalTime);
            clearInterval(intervalConfig);
            clearInterval(intervalUpdates);
        };
    });

    let notificationPrimary = null;
    // TEMP CODE just to load a notification in regardless of time
    $: {
        if (!showLoadingScreen) {
            try {
                //notificationPrimary = config.notifications.logic.primary[0];
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
        Time Crier
</div>

<!-- app -->
<div class="core" >
    <Clock {time} color={clockColor} height={clockHeight} />
    <!-- FAR FUTURE TODO: weather (current + upcoming) -->
    <div style="clear:both"></div>
    <Notifications collection={nCollection} {time} {activePrimary}></Notifications>
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
