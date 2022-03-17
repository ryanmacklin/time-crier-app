<script>
	export let hours;
	export let minutes;
//	export let seconds;
	let hour, minute, pm, fulltime, color, truetime, difference, red, green, blue, x;
	
	let timeColor = 'cyan';
	$: cssVarStyles = `--time-color:${timeColor}`;
	
	
	$: {
		if (hours == 0) {
			pm = "AM";
			hour = 12;
		} else if (hours > 12) {
			pm = "PM";
			hour = hours - 12;
		} else {
			pm = "AM";
			hour = hours;
		}
		if (hour < 10) {
			hour = " " + hour;
		}
		
		if (minutes < 10) {
			minute = "0" + minutes;
		} else {
			minute = minutes;
		}
		
		fulltime = (hours * 100) + minutes;
		truetime = (hours * 60) + minutes;
		
		if (fulltime < 2300 && fulltime >= 500) {
			timeColor = "#OOFFFF"; // cyan
		} else if (fulltime > 215 && fulltime < 500) {
			timeColor = "#FFA500"; // orange
		} else if (fulltime >= 2300 || fulltime <= 130) {
			difference = truetime - 1380; // start at 11pm
			if (difference < 0) difference += 1380 + 60;
			// calc gradient from cyan #OOFFFF to yellow #FFFFOO
			let perc = difference / (60 + 60 + 30);
			red = Math.round(255 * perc);
			green = 255;
			blue = Math.round(255 * (1 - perc));
			timeColor = "rgb(" + red + "," + green + "," + blue + ")";
		} else if (fulltime >= 131 && fulltime <= 215) {
			difference = truetime - 90; // start at 130a
			// calc gradient from yellow #FFFFOO to orange #FFA500
			let perc = difference / (45);
			red = 255;
			green = 255 - Math.round(90 * perc);
			blue = 0;
			timeColor = "rgb(" + red + "," + green + "," + blue + ")";			
		}
	}
</script>

<p style="{cssVarStyles}">
	<span class="time">{hour}:{minute}</span><span class="pm">{pm}</span>
</p>
<p class="diagnostic">{timeColor}</p>

<style>
	/* Write your CSS here */

	@font-face {
		font-family: clockface;
		src: url('/fonts/Technology.ttf');
	}

	p {
		font-family: clockface, monospace;
		font-size: 100px;
		margin: 0;
		padding: 0;
	}
	.time {
		color: var(--time-color, white);
	}
	.pm {
		color: var(--time-color, white);
		font-size: 50%;
	}
	.diagnostic {
		display: none;
	}
</style>

<!--
cyan
#00FFFF
rbg (0, 100, 100)

yellow
FFFF00
rbg(100, 100, 0)

orange
FFA500
rgb(100, 65, 0)

2300 to 1:30: cyan to yellow
1:31 to 2:15: yellow to orange
2:16 to 5a: stay orange

-->
