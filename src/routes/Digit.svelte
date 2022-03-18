<script>
	export let value = '';
	export let height = 100;
	export let color = '#FF0000';
	export let padding = 5;
	export let slim = false; // solely for values of 1 that shouldn't be full size
	export let style = ''; // any styles to add to SVG

	let use = value.substring(0, 1).toUpperCase();
	let pad = padding * (height / 100); // let padding scale with height size; precise padding can be added to the style directly
	
	let width = (height / 312.56) * 168.31 // original size: width = 168.31    height = 312.56
	if (use == "1" && slim) {
		width = (height / 312.56) * 35.21 // original size of slim: width = 35.21    height = same
	} else if (use == ":") {
		width = (height / 312.56) * 55 // original size of slim: width = 55    height = same		
	}
	let styleOn = "fill: " + color;
	let styleOff = "visible: false";
	
	// need to account for slim 1 and colon
	
	var active = {
		"top": false,
		"upper-left": false,
		"upper-right": false,
		"middle": false,
		"lower-left": false,
		"lower-right": false,
		"bottom": false
	}
	switch (use) {
		case '0':
			active["top"] = true;
			active["upper-left"] = true;
			active["upper-right"] = true;
			active["middle"] = false;
			active["lower-left"] = true;
			active["lower-right"] = true;
			active["bottom"] = true;
			break;
		case '1':
			active["top"] = false;
			active["upper-left"] = false;
			active["upper-right"] = true;
			active["middle"] = false;
			active["lower-left"] = false;
			active["lower-right"] = true;
			active["bottom"] = false;
			break;
		case '2':
			active["top"] = true;
			active["upper-left"] = false;
			active["upper-right"] = true;
			active["middle"] = true;
			active["lower-left"] = true;
			active["lower-right"] = false;
			active["bottom"] = true;
			break;
		case '3':
			active["top"] = true;
			active["upper-left"] = false;
			active["upper-right"] = true;
			active["middle"] = true;
			active["lower-left"] = false;
			active["lower-right"] = true;
			active["bottom"] = true;
			break;
		case '4':
			active["top"] = false;
			active["upper-left"] = true;
			active["upper-right"] = true;
			active["middle"] = true;
			active["lower-left"] = false;
			active["lower-right"] = true;
			active["bottom"] = false;
			break;
		case '5':
			active["top"] = true;
			active["upper-left"] = true;
			active["upper-right"] = false;
			active["middle"] = true;
			active["lower-left"] = false;
			active["lower-right"] = true;
			active["bottom"] = true;
			break;
		case '6':
			active["top"] = true;
			active["upper-left"] = true;
			active["upper-right"] = false;
			active["middle"] = true;
			active["lower-left"] = true;
			active["lower-right"] = true;
			active["bottom"] = true;
			break;
		case '7':
			active["top"] = true;
			active["upper-left"] = false;
			active["upper-right"] = true;
			active["middle"] = false;
			active["lower-left"] = false;
			active["lower-right"] = true;
			active["bottom"] = false;
			break;
		case '8':
			active["top"] = true;
			active["upper-left"] = true;
			active["upper-right"] = true;
			active["middle"] = true;
			active["lower-left"] = true;
			active["lower-right"] = true;
			active["bottom"] = true;
			break;
		case '9':
			active["top"] = true;
			active["upper-left"] = true;
			active["upper-right"] = true;
			active["middle"] = true;
			active["lower-left"] = false;
			active["lower-right"] = true;
			active["bottom"] = true;
			break;
		case 'A':
			active["top"] = true;
			active["upper-left"] = true;
			active["upper-right"] = true;
			active["middle"] = true;
			active["lower-left"] = true;
			active["lower-right"] = true;
			active["bottom"] = false;
			break;
		case 'P':
			active["top"] = true;
			active["upper-left"] = true;
			active["upper-right"] = true;
			active["middle"] = true;
			active["lower-left"] = true;
			active["lower-right"] = false;
			active["bottom"] = false;
			break;
	}
</script>
{#if (use == '')}
<!-- no char -->
{:else if (use == ':')}
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 55 312.56" style="width: {width}; height: {height}; enable-background:new 0 0 {width} {height}; padding-left: {pad}; padding-bottom: {pad}; {style}" xml:space="preserve">
<rect style="{styleOn}" x="10" y="67.06" width="35" height="35"/>
<rect style="{styleOn}" x="10" y="210.5" width="35" height="35"/>
<!-- alt -->{use}
</svg>
{:else if (use == '1' && slim)}
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 35.21 312.56" style="width: {width}; height: {height}; enable-background:new 0 0 {width} {height}; padding-left: {pad}; padding-bottom: {pad}; {style}" xml:space="preserve">
<!-- upper (upper-right) --><path style="{styleOn}" d="M0,127.87V40.22c0-0.53,0.21-1.04,0.58-1.41l20.77-20.84c0.78-0.78,2.05-0.79,2.83,0l10.23,10.2
	c0.38,0.38,0.59,0.89,0.59,1.42v108.9c0,0.53-0.21,1.04-0.59,1.42l-10.23,10.23c-0.78,0.78-2.05,0.78-2.83,0L0.58,129.29
	C0.21,128.91,0,128.4,0,127.87z"/>
<!-- lower (lower-right) --><path style="{styleOn}" d="M0.21,271.83v-87.65c0-0.53,0.21-1.04,0.58-1.41l20.77-20.84c0.78-0.78,2.05-0.79,2.83,0l10.23,10.2
	c0.38,0.38,0.59,0.89,0.59,1.42v108.9c0,0.53-0.21,1.04-0.59,1.42L24.4,294.08c-0.78,0.78-2.05,0.78-2.83,0L0.8,273.24
	C0.42,272.86,0.21,272.36,0.21,271.83z"/>
<!-- alt -->{use}
</svg>
{:else}
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 168.31 312.56" style="width: {width}; height: {height}; enable-background:new 0 0 {width} {height}; padding-left: {pad}; padding-bottom: {pad}; {style}" xml:space="preserve">
<!-- top --><path style="{(active['top'] ? styleOn : styleOff)}" d="M127.87,35H40.22c-0.53,0-1.04-0.21-1.41-0.58L17.97,13.65c-0.78-0.78-0.79-2.05,0-2.83l10.2-10.23
	C28.54,0.21,29.05,0,29.58,0h108.9c0.53,0,1.04,0.21,1.42,0.59l10.23,10.23c0.78,0.78,0.78,2.05,0,2.83l-20.84,20.76
	C128.91,34.79,128.4,35,127.87,35z"/>
<!-- upper-left --><path style="{(active['upper-left'] ? styleOn : styleOff)}" d="M35,40.73v87.65c0,0.53-0.21,1.04-0.58,1.41l-20.77,20.84c-0.78,0.78-2.05,0.79-2.83,0l-10.23-10.2
	C0.21,140.07,0,139.56,0,139.03V30.12c0-0.53,0.21-1.04,0.59-1.42l10.23-10.23c0.78-0.78,2.05-0.78,2.83,0l20.76,20.84
	C34.79,39.7,35,40.2,35,40.73z"/>
<!-- upper-right --><path style="{(active['upper-right'] ? styleOn : styleOff)}" d="M133.1,127.87V40.22c0-0.53,0.21-1.04,0.58-1.41l20.77-20.84c0.78-0.78,2.05-0.79,2.83,0l10.23,10.2
	c0.38,0.38,0.59,0.89,0.59,1.42v108.9c0,0.53-0.21,1.04-0.59,1.42l-10.23,10.23c-0.78,0.78-2.05,0.78-2.83,0l-20.76-20.84
	C133.31,128.91,133.1,128.4,133.1,127.87z"/>
<!-- middle --><path style="{(active['middle'] ? styleOn : styleOff)}" d="M37.79,137.74h93.15c0.53,0,1.03,0.21,1.4,0.58L149,154.71c0.8,0.78,0.8,2.07,0,2.85l-16.86,16.67
	c-0.37,0.37-0.88,0.58-1.41,0.58H37.58c-0.53,0-1.03-0.21-1.4-0.58l-16.65-16.39c-0.8-0.78-0.8-2.07,0-2.85l16.86-16.67
	C36.76,137.95,37.27,137.74,37.79,137.74z"/>
<!-- lower-left --><path style="{(active['lower-left'] ? styleOn : styleOff)}" d="M35.21,184.69v87.65c0,0.53-0.21,1.04-0.58,1.41l-20.77,20.84c-0.78,0.78-2.05,0.79-2.83,0L0.8,284.4
	c-0.38-0.38-0.59-0.89-0.59-1.42v-108.9c0-0.53,0.21-1.04,0.59-1.42l10.23-10.23c0.78-0.78,2.05-0.78,2.83,0l20.76,20.84
	C35,183.65,35.21,184.16,35.21,184.69z"/>
<!-- lower-right --><path style="{(active['lower-right'] ? styleOn : styleOff)}" d="M133.31,271.83v-87.65c0-0.53,0.21-1.04,0.58-1.41l20.77-20.84c0.78-0.78,2.05-0.79,2.83,0l10.23,10.2
	c0.38,0.38,0.59,0.89,0.59,1.42v108.9c0,0.53-0.21,1.04-0.59,1.42l-10.23,10.23c-0.78,0.78-2.05,0.78-2.83,0l-20.76-20.84
	C133.52,272.86,133.31,272.36,133.31,271.83z"/>
<!-- bottom --><path style="{(active['bottom'] ? styleOn : styleOff)}" d="M40.44,277.56h87.65c0.53,0,1.04,0.21,1.41,0.58l20.84,20.77c0.78,0.78,0.79,2.05,0,2.83l-10.2,10.23
	c-0.38,0.38-0.89,0.59-1.42,0.59H29.83c-0.53,0-1.04-0.21-1.42-0.59l-10.23-10.23c-0.78-0.78-0.78-2.05,0-2.83l20.84-20.76
	C39.4,277.77,39.91,277.56,40.44,277.56z"/>
<!-- alt -->{use}
</svg>
{/if}
