<script>
    import Digit from './Digit.svelte';

	export let hours;
	export let minutes;
	export let seconds; /* not using yet, but will when I add in exercise mode */
    export let height = 250;
    export let showSeconds = true;

    let hour, pm;
    let color = '#FFFFFF';


    $:{
        if (hours > 12) {
            hour = hours - 12;
            pm = true;
        } else if (hours == 0) {
            hour = hours;
            pm = false;
        } else {
            hour = 12;
            pm = false;
        }
    }
</script>

<div style="verical-align: top;">
    <Digit value="{(hour / 10).toString()}" {color} {height} slim />
    <Digit value="{(hour % 10).toString()}" {color} {height} />
    <Digit value=":" {color} {height} />
    <Digit value="{(minutes / 10).toString()}" {color} {height} />
    <Digit value="{(minutes % 10).toString()}" {color} {height} />
    {#if showSeconds}
    <Digit value=":" {color} {height} />
    <Digit value="{(seconds / 10).toString()}" {color} {height} />
    <Digit value="{(seconds % 10).toString()}" {color} {height} />
    {/if}
    <Digit value="{pm ? "P" : "A"}" {color} {height} />
    {#if pm}
    <Digit value="P" {color} height={height / 2} />
    <span style="position: relative; top: {0-(height/2)}" ><Digit value="P" {color} height={height / 2} /></span>
    {:else}
    <Digit value="A" {color} height={height / 2} style="padding-bottom: {height / 2}" />
    {/if}
</div>