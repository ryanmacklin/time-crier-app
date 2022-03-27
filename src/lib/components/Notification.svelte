<script>
import { General } from "$lib/scripts/utils.cjs";
import { fade } from 'svelte/transition';


    export let value = null;
    export let overrideCss = "";
    export let styleType = "";

    let existingValue = null;
    let styleCss = "";
    let transitionCss = "";
    let opacity = 0;

    let show = false;
    let id = null;
    let text = "";

    let transitionStyles = {
        'notification-opacity': "0",
        //'notification-display': 'block',
    };
    $: transitionCss = General.makeCssString(transitionStyles);

    $: {
        if (existingValue != value) {
            // changes!

            // check if the new value is or isn't blank
            if (General.hasValue(value)) {
                // has an object (hopefully!)
                existingValue = value; // start with assignment to keep this from happening unnecessarily the next tick

                // fade out if there's already a value
                change(value);
            } else {
                // no more notification!
                existingValue = null;
            }
            // transition back in, with current transition rules
        }

        //show = (existingValue.text != "");
    }

    async function change(v) {
        General.log("changing message");
        // fade in if there's already any fade in
        if (transitionStyles["notification-opacity"] != "0") {
            await fadeOut();
        }

        id = v.id;
        text = v.text;
        // other assignments here
        styleCss = generateStyleCode(styleType);

        await fadeIn();
    }

    async function fadeOut() {
        let divis = 1 / 50;
        let pause = 50;
        // fade out loading
        let p = 1;
        while (p >= 0.2) {
            transitionStyles["notification-opacity"] = p.toString();
            p -= divis;
            await General.sleep(pause);
        }
        transitionStyles["notification-opacity"] = "0";
        return true;
    }

    async function fadeIn() {
        let divis = 1 / 50;
        let pause = 50;
        let p = 0.2;
        while (p <= 1) {
            transitionStyles["notification-opacity"] = p.toString();
            p += divis;
            await General.sleep(pause);
        }
        transitionStyles["notification-opacity"] = "1";
        return true;
    }

    function generateStyleCode(type = "") {
        let res = "";
        switch (type) {
            case "blah":
                break;
            default:
                if (type != "") General.log("Warning: Notification style \"" + type + "\" not found. Using default."); // console log warning
                res += "font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;";
                res += "color: cyan";
        }
        return res;
    }
</script>
<div class="notification" style="{styleCss};{overrideCss};{transitionCss}">{text}</div>
<style>
    div.notification {
        display: var(--notification-display, "block");
        opacity: var(--notification-opacity, "1");
    }
</style>
