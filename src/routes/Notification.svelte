<script>
    export let text = "";
    export let style = "";
    let existingText = "";

    let show = false;

    $: {
        if (existingText != text) {
            // text changes
            existingText = text;
        }
        show = (existingText != "");
    }
</script>
{#if show}
<div style="{style}">{existingText}</div>
{/if}
<style>
    /* div.notNow {
        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        font-size: 5rem;
        line-height: 1;
		color: white;
    } */
</style>
