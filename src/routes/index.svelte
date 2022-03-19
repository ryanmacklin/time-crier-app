<script>
    import { onMount } from 'svelte';
    import Clock from './Clock.svelte';
    import Notifications from './Notifications.svelte';

    /*** START TIME ****/
    let time = new Date();
    let hours, minutes, seconds;
    // these automatically update when `time` changes, because of the `$:` prefix
    $: {
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
    }
    /* TODO: there's an issue where when this refreshes, it goes for server time first, then blinks to local time. At least, does when playing in gitpod. I hate that. */

    onMount(async () => {
          const intervalTime = setInterval(() => {
              time = new Date();
          }, 1000);
    });
    /*********************/

    /**** START NOTIFICATIONS ****/
    let primary = "modulo init: can you do 5 minutes of exercise?", newPrimary;

    onMount(async () => {
        /* const intervalStatus = setInterval(() => {
        let truetime = (hours * 60) + minutes;
        let newPrimary = getStatus(truetime);
        if (newPrimary != "" && newPrimary != primary) primary = newPrimary;
        }, 1000);

        return () => {
            clearInterval(intervalTime);
        }; */
    });
    /*********************/

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
  <svelte:head>
    <title>Time Crier</title>
  </svelte:head>

  <Clock {time} />
  <!-- FAR FUTURE TODO: weather (current + upcoming) -->
  
<div style="clear:both"></div>

  <Notifications primary="Sleep is respecting yourself" secondary="Can you do 5 minutes of exercise soon?"></Notifications>

  