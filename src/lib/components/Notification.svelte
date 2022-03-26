<script>
    export let value = null;
    export let style = "";
    let existingValue = null;

    let show = false;
    let id = null;
    let text = "";

    $: {
        if (existingValue != value) {
            // changes!

            // transition out first if we have anything showing, per its transition rules
            existingValue = value;
            id = existingValue.id;
            text = existingValue.text;

            // transition back in, with current transition rules
        }

        //show = (existingValue.text != "");
    }


</script>
<div style="{style}">{text}</div>
<style>
    /* div.notNow {
        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        font-size: 5rem;
        line-height: 1;
		color: white;
    } */
</style>
