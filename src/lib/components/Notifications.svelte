<script>
	// REFACTOR? have this just tackle primary or secondary? but account for what secondary looks like when a primary exists vs. doesn't
    import Notification from '$lib/components/Notification.svelte';
    import { General } from '$lib/scripts/utils.cjs';
    import { NotificationsClass } from '$lib/scripts/notificationsClass.cjs';

	export let collection = null;
	export let activePrimary = null;
	export let activeSecondary = null;

	let currentCollection = null;
	let storedPrimary = null;
	let storedSecondary = null;
	let currentPrimary = null;
	let currentSecondary = null;

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

	/*
							continuous-small (if multiple texts, rotate every 5-8 minutes)
							continuous-big (if multiple texts, rotate every 25-30 minutes)
							rotation-small (5-8 minute displays, pauses for 40-50 minutes)
							rotation-big (25-30 minute displays, pauses for 5-10 minutes)
	*/

	let primaryData = null; // active info: string, style, transition
	let secondaryData = null;

	let activePause = null; // seconds to pause until the next active thing
	let secondaryPause = null;

	let primaryEndSignal = null;
	let secondaryEndSignal = null;

	let primarySignals = [];

	function makeClearSignals(ary) {
		let res = [];
		//if (General.isIterable(ary)) {
			for(let i = 0; i < ary.length; i++) {
				res[i] = false;
			}
		//}
		return res;
	}

	// TODO just doing primary now, will do secondary later
	$:{
		// check to see if we need to change the collection system entirely
		if(currentCollection != collection) {
			currentCollection = collection;
			if (General.isIterable(currentCollection.primary)) {
				primarySignals = makeClearSignals(currentCollection.primary);

			} else {
				primarySignals = [];
			}
			// gotta reset everything
			storedPrimary = null;
			currentPrimary = null;
		}
		//General.logObject(currentCollection.primary, "signals");
	}

	// TODO include priority, defaulting to 2. Lower = higher (namely 0, 1, etc)

	$:{
		// check to see if we need to change notifications
		if(true) { //activePrimary != storedPrimary) {
			//General.log("Active primary changed");
			storedPrimary = activePrimary;
			currentPrimary = activePrimary;
			if (Number.isInteger(currentPrimary)) currentPrimary = [currentPrimary]; // make array of 1 if is just an integer

			if (General.isFilledArray(currentPrimary)) {
				// at least one active primary now
				currentPrimary.forEach(idx => {
					// only works in the index maps to something in the collection
					if (idx in primarySignals) {
						// if we already have an active signal for this one, we don't need to do more
						if (primarySignals[idx]) {
							// do nothing
						} else {
							// activate this signal!
							let notif = currentCollection.primary[idx];
							//General.logObject(notif);
							if (General.isReal(notif)) {
								General.log("Activating notifcation " + notif["name"]);
								primarySignals[idx] = true;
								// NOW ACTIVATE THE SIGNAL FOR REAL

								let x = NotificationsClass.calculateSpan(notif);
console.log(x);
							} else {
								storedPrimary = null; // it needs to be redone
							}
						}
					} else {
						// TODO ERROR! index isn't in bounds for some damn reason about calculations
					}
				});

			} else {
				// no active primaries now
				primaryEndSignal = (new Date()).getTime();
			}

		}
	}



</script>

<div class="notifications">
	<!-- these components don't handle animation/transition decision logic, just displays what it's told, and maybe simple ani/trans execution -->
	<Notification  />
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

	/* p.alert {
		color: rgb(252, 59, 59);
	}

	p.sleep {
		color: rgb(252, 176, 0);
	}

	p.health {
		color: rgb(105, 209, 122);
	} */
</style>
