<script>
  import Clock from './Clock.svelte';
  import Status from './Status.svelte';
	
	import { onMount } from 'svelte';

	let time = new Date();
	let hours, minutes, seconds;
	let status = "", newStatus;

	// these automatically update when `time`
	// changes, because of the `$:` prefix
	$: {
		hours = time.getHours();
		minutes = time.getMinutes();
		seconds = time.getSeconds();
	}

	onMount(() => {
		const intervalTime = setInterval(() => {
			time = new Date();
		}, 1000);

 	 const intervalStatus = setInterval(() => {
		 let truetime = (hours * 60) + minutes;
		 let newStatus = getStatus(truetime);
		 if (newStatus != "" && newStatus != status) status = newStatus;
		}, 1000);

		return () => {
			clearInterval(intervalTime);
		};
	});
	
	function getStatus(truetime) {
		let newStatus = "";
		if (truetime % 10 == 5) {
			newStatus = "modulo 5 last: have you exerised recently?";
		} else if (truetime %10 == 3) {
			newStatus = "modulo 3 last: have you had water recently?";
		} else if (truetime %10 == 8) {
			newStatus = "modulo 8 last: did you take meds today?";
		} else if (truetime %10 == 0) {
			newStatus = "modulo 0 last: have you had sunlight today?";
		}
		return newStatus;
	}

	
</script>

<Clock {hours} {minutes} {seconds}></Clock>

<Status text={status}></Status>

<style>
	/* Write your CSS here */
	:global(body) {
		color: white;
		background-color: black;
	}
</style>
