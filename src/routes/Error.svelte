<script>
    export let type = "alert"; // alert or warning
    export let message = "";
</script>
{#if (message)}
<div>
{type}: {message}
</div>
{/if}

<style>
    
</style>