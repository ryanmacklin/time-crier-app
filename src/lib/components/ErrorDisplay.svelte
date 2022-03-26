<script>
    import { slide } from 'svelte/transition';
    export let type = "alert"; // alert or warning
    export let message = "";
    export let error;
</script>
{#if (error)}
<div transition:slide>
    {error}<br>
{type}: {message}
</div>
{/if}

<style>
    div {
        font-size: 50px;
        color: #FF9999;
    }
</style>