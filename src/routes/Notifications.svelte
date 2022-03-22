<script>
    import Notification from './Notification.svelte';
	export let primary = null;
	export let secondary = null;
	/* INTENDED LOGIC

		1) when there's a primary notice, that should be prominenet and in a "primary" style
		Things like "hey, garbage!" or "Go to bed!"
		Those persist until a trigger unsets (time or a button press) or primary changes (there's a new one)
		1a) it includes an optional style, like "alert" or "sleep"
		2) when there's a secondary notice, that should be in a less prominent style
		Those persist for a short period, and can have more than one queue, in which case they rotate
		2a) when there's a secondary notice but no primary notice, the seconday notice is bigger, but otherwise in the same style
		2b) there are also optional styles here
		3) when there's no notice, there's nothing to fuckin' do
		4) within the notifications spec, there can be a random assortment of ways of wording the notifcation,
		one of which is applied at time of instantiation. But that's handled by whatever feeds this the notification
		5) The transitions shouldn't be jarring. There should be fade in/outs, unless the style or code says "no, make this transition jarring" (like automatically with alert)
		6) Later, this should handle implementing icons (likely as stored SVGs) like "{garbage}" for garbage can or "{alert}" for alert triangle
	*/
	/*
	            {
                "tag": "mortgage",
                "text": "Pay mortgage!",
                "priority": 0,
                "displayLogic": {
                    "dayMonth": -1,
                    "startTime": 1000,
                    "endTime": 2300,
                    "type": "continuous"
                }
            }
	*/


	let primaryText = "";
	let secondaryText = "";

	// this is eventually a function to handle both primary and secondary
	$:{ 
		if (primary !== null && primary !== undefined) {
			if (typeof primary.text === "string") { // is an object value, at least one we'll attempt to trust
				primaryText = primary.text;
				// other stuff for entire object
			} else if (typeof primary === "string") { // is a text value
				primaryText = primary;
				// other stuff for just text
			}
		} else {
			primaryText = "";
		}
	}
	
</script>

<div class="notifications">
	<!-- these components don't handle animation/transition decision logic, just displays what it's told, and maybe simple ani/trans execution -->
	<Notification text={primaryText} />
	<Notification text={secondaryText} />
</div>

<style>
	div.notifications {
		margin-top: 1em;
        /* defaults */
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
		font-size: 3.75rem; /* 60px */
		line-height: 1;
		color: white;
	}

	p.alert {
		color: rgb(252, 59, 59);
	}

	p.sleep {
		color: rgb(252, 176, 0);
	}

	p.health {
		color: rgb(105, 209, 122);
	}
</style>
