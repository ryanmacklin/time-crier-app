<script>
    import Digit from '$lib/components/Digit.svelte';
    import Tsp from '$lib/components/Tsp.svelte';
    import { Time } from '$lib/scripts/utils.cjs';

    export let time = new Time();
    export let height = 250;
    export let color = '#FFFFFF'; // we'll let elements outside of clock handle changing the color

    /* working space vars */
    let hours, minutes, seconds;
    let curTime;
    let digits = Time.clockDigitsStruct;
    let secOpacity = 0;
    let secOpacTime = 0;
    let secOpacTimeFade = 0;

    /* calculating height of sub-elements */
    let divheightSeconds = 3.5;
    let divheightPm = 2.25;
    let divheightSpacing = 19 * (height / 100);

    /* things that could be global settings in config file */
    let secOpacTimeout = 120; // 2 minutes/120 seconds
    let secOpacTimeoutStartfade = 15; // fades over 15 seconds
    let secOpacRefreshThreshold = 0.5;

    $: { // these automatically update when `time` changes, because of the `$:` prefix
        hours = time.hours;
        minutes = time.minutes;
        seconds = time.seconds;
        curTime = time.timestampInSeconds;
        digits = time.clockDigits;

        if (secOpacity > 0) {
            // count down opacity
            if (curTime >= secOpacTimeFade) {
                secOpacity = 1 - ((curTime - secOpacTimeFade) / (secOpacTime - secOpacTimeFade));
                //secOpacTime = 0;
            }
        }
    }

	function acivateOpacity() {
        if (secOpacity <= secOpacRefreshThreshold) {
            // activate (or renew) opacity
            secOpacity = 1;
            secOpacTime = curTime + (secOpacTimeout);
            secOpacTimeFade = curTime + (secOpacTimeoutStartfade);
        } else {
            // immediately deactivate opacity
            secOpacity = 0;
            secOpacTime = 0;
            secOpacTimeFade = 0;
        }
	}
</script>

<div class="clock" on:click={acivateOpacity}>
    <div class="clock-main">
        <Digit value="{digits.h1}" {color} {height} slim />
        <Digit value="{digits.h2}" {color} {height} />
        <Digit value=":" {color} {height} />
        <Digit value="{digits.m1}" {color} {height} />
        <Digit value="{digits.m2}" {color} {height} />
    </div>
    <div class="clock-suffix">
        <div class="clock-seconds" style="opacity: {secOpacity}">
            <Tsp height={2} style="display: block" />
            <Digit value="{digits.s1}" {color} height={height / divheightSeconds} />
            <Digit value="{digits.s2}" {color} height={height / divheightSeconds} />
            <Tsp height={divheightSpacing} style="display: block" />
        </div>
        <div class="clock-pm">
            <Digit value="{digits.pm ? "P" : "A"}" {color} height={height / divheightPm} /> 
        </div>
    </div>
</div>

<style>
    div.clock {
        float: right;
        white-space: nowrap;
    }
    div.clock-main {
        display: inline-block;
    }
    div.clock-suffix {
        display: inline-block;
        vertical-align: top;
        padding-left: 10px;
    }
    div.clock-seconds {
        display: block;
    }
    div.clock-pm {
        display: block;
    }
</style>