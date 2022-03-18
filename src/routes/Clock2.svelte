<script>
    import Digit from './Digit.svelte';

	export let hours;
	export let minutes;
	export let seconds; /* not using yet, but will when I add in exercise mode */
    export let height = 250;
    export let showSeconds = false;

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

<div>
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
    <Digit value="{pm ? "P" : "A"}" {color} height={height / 2} style="vertical-align: {pm ? "bottom" : "top"}" /> 
</div>

<style>
    div {
        float: right;
        white-space: nowrap;
        display: block;
        height: 255; /* hardcoding just to get this one stage done */
    }

</style>