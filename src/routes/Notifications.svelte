<script>
	export let primary;
	export let secondary;
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

	
</script>

<p class="primary sleep">
	{primary}
</p>
<p class="secondary health">
	{secondary}
</p>

<style>
	p.primary {
		font-size: 5rem; /* 60px */
		line-height: 1;
		color: white;
	}
	p.secondary {
		font-size: 3.75rem; /* 60px */
		line-height: 1;
		margin-top: 1em;
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
