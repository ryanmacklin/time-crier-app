<script>
    export let text = "";
    export let style = "";

    let show = (text != "");
</script>
{#if show}
<p style="{style}">
	{text}
</p>
{/if}
<style>
    p.notNow {
        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        font-size: 5rem; /* 60px */
        line-height: 1;
		color: white;
    }
</style>
