<script>
	export let text;
	//export let style;
	let current = "";
	
	$:{
//		if (text != undefined && current != text) current = text;
		if (text != undefined && current != text) current = text;
	}
	
</script>

<p>
	{current}
</p>

<style>
	p {
	   color: white; /* just to keep the warning off */
	}
</style>
