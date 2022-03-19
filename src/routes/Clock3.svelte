<script>
    import Digit from './Digit.svelte';
    import Tsp from './Tsp.svelte';
    import { onMount } from 'svelte';

    export let height = 250;
    export let color = '#FFFFFF'; // we'll let elements outside of clock handle changing the color

    let hours, minutes, seconds;

    let time = new Date();
    let hour, pm;

    let divheightSeconds = 3.5;
    let divheightPm = 2.25;
    let divheightSpacing = 19 * (height / 100);

    let h1, h2, m1, m2, s1, s2;
    let secOpacity = 0;
    let secOpacTime = 0;
    let secOpacTimeFade = 0;
    let secOpacTimeout = 10; // 5 minutes/300 seconds
    let secOpacTimeoutStartfade = 5;

    onMount(async () => {
          const intervalTime = setInterval(() => {
              time = new Date();
          }, 1000);
    }

    $: {
          hours = time.getHours();
          minutes = time.getMinutes();
          seconds = time.getSeconds();
      }

    $:{
        if (hours > 12) {
            hour = hours - 12;
            pm = true;
        } else if (hours == 0) {
            hour = 12;
            pm = false;
        } else {
            hour = hours;
            pm = false;
        }

        h1 = (hour / 10).toString().substring(0,1);
        if (h1 == "0") h1 = ""; // use " " if I ever want it to take up the same amount of space
        h2 = (hour % 10).toString();
        m1 = (minutes / 10).toString().substring(0,1);
        m2 = (minutes % 10).toString();
        s1 = (seconds / 10).toString().substring(0,1);
        s2 = (seconds % 10).toString();

        if (secOpacity > 0) {
            // count down opacity
            if (curTime() > secOpacTimeFade) { // right now this doesn't cover when time wraps around
                secOpacity = 0;
                //secOpacTime = 0;
            }
        }
    }

    function curTime() {
        return ((hours * 60) + minutes) * 60 + seconds;
    }

	function acivateOpacity() {
        if (secOpacity < 0.5) {
            // activate (or renew) opacity
            secOpacity = 1;
            secOpacTime = curTime() + secOpacTimeout;
            secOpacTimeFade = curTime() + secOpacTimeoutStartfade;
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
        <Digit value="{h1}" {color} {height} slim />
        <Digit value="{h2}" {color} {height} />
        <Digit value=":" {color} {height} />
        <Digit value="{m1}" {color} {height} />
        <Digit value="{m2}" {color} {height} />
    </div>
    <div class="clock-suffix">
        <div class="clock-seconds" style="opacity: {secOpacity}">
            <Tsp height={2} style="display: block" />
            <Digit value="{s1}" {color} height={height / divheightSeconds} />
            <Digit value="{s2}" {color} height={height / divheightSeconds} />
            <Tsp height={divheightSpacing} style="display: block" />
        </div>
        <div class="clock-pm">
            <Digit value="{pm ? "P" : "A"}" {color} height={height / divheightPm} /> 
        </div>
    </div>
</div>
{secOpacTimeFade - (((hours * 60) + minutes) * 60 + seconds)}

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