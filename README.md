# Time Crier
A SvelteKit app by Ryan Macklin, as a home utility and a Svelte/git learning project

# An ADHD temporality reminder tool
**Time Crier** addresses our household's issues with time, starting with remembering to go to bed, get exercise, and take out the garbage. It's intended to run on as a persistent system on second monitors, old tablets mounted on walls, old computers sitting near an entertainment center, etc.

The problems with one-time or snoozable reminders on phones is that:
 1. Those reminders are ephemeral, and once closed or snoozed they stop existing
 2. That requires paying attention to phone notifications, which doesn't happen when in a flow state
 3. That assumes phone notifications make any noise or buzzing at very late hours, which isn't the case for this household

# What it does
This version of Time Crier has two functions:
 1. Display time in a large, relatively pleasing font with consistent spacing, with color that changes as "you should definitely go to bed already" time approaches
 2. Show periodic & scheduled notifications about reminders or health prompts, that are visible but not interrupting (we'll use calendar apps for what needs interrupting), and time out on their own

# How the overall system *should* work
There's a config JSON file with info on clock colors, notifications, and other info. (Future configs involving API keys or the like would be in a separate config file.)

When the system reads the config file, it uses that to "compile" the next approximately 6 hours of clock colors and notifications, on a minute-by-minute basis. This is the "time load." When there's only a couple hours left in time load, it compiles the next 6 hours. (With "approximate" meaning that if there's a primary notification that's ongoing, it'll keep compiling the time load until there's not a notification to deal with.)

The config includes an update string that tells the instance if the JSON has updated recently. The system polls the JSON file periodically, and if that update string has changed from what it currently recognizes, it loads and compiles a new time load, then replaces the current time load. If there's an error with loading/compiling, there's an error icon that shows up on the screen instead, and the existing info is used to keep going. That way there's less of a chance of system interruption.

Ideally, if this is served externally and there's an internet outage, the system shouldn't break down.

## How clock *should* work
In the config JSON file, RGB values are associated with time, along with how many minutes should be spend fading into that color. For how ours works (as we're late-night people):

- The default color is white; rbg(255, 255, 255)
- The "maybe wind down" color is cyan; rbg(X, X, X). It starts at 12:10a, with a 10-minute fade-in.
- The "how about going to bed?" color is green; rbg(X, X, X). It starts at 1:45a, with a 45-minute fade in.
- The "no really, bed" color is orange; rgb(X, X, X). It starts at 2:30a, with a 45-minute fade in (meaning it immediately fades in from green).
- The "are you still up?" color is red; rbg (X, X, X). It starts at 3:00a, with a stark shift/no fade-in
- The default color resets at 5a, with a stark shift.

## How notification system *should* work
There are two types of notifications: primary and secondary. Primary notifications are things like "go to bed" or "take the garbage out." Secondary ones are like "hey go for a walk" or "had some water lately?"

When there's more than one of a given type active at a time, they rotate through with visible interruption to show there's a change in message—such as "take out the garbage" being on Tuesday nights from 9pm to 3am, and "go to bed" being every night from 1:30am to 4am.

Primary notifications are set at specific times. Secondary notifications are set at general time ranges and estimated intervals, to be randomly generated throughout the day as 10-minute (or otherwise specified) reminders that time out.

## TODOs
(in no particular order)

 - Make these issues in GitHub
 - Make clock font better, as SVGs that scale perfectly with size/needs rather than a font file
 - Implement initial loading of config file & compiling of "time load"
 - Implement polling and updating config file
 - Implement error handling: error getting JSON, error reading JSON, error compiling time load, error with connection (along with when error began)
 - Store time load in session, so it can be pulled from if page refreshes
 - Rotate time load
 - FIX: the glitch where it starts with server time zone and not local time zone for the first second, so it has that awkward flicker when starting up
 - Allow for multiple forms of the same notification (such as 4 ways of saying "get exercise" or "go to bed") that either randomly rotate throughout the specified time (for bed) or randomly get chosen for that duration (for exercise)

## Future ideas
(in no particular order)

 - Custom SVG emojis, like "{R}" meaning "draw a gnome for a Ryan notification" or "{J}" meaning "draw a squirrel for a Jen notification"
 - Show current and upcoming local weather (night during day, next day during night)
 - Dismissing periodic notifications like exercises, to say "yes I did this today, I don't need to be reminded again later today"
 - Allow for different types of primary and secondary notifications, such as alerts (that also change the clock color, overriding while that alert is active)
 - Poll a second "critical alert" JSON file that adds new alerts that need to happen but don't otherwise change the ongoing config
 - Hook into a gCal
 - Maybe allow for interrupting notifications that flag the browser to make a notification happen
 - Have individual unit-level notifications, like specifying "basement" in the URL means that basement-only notifications happen and explicitly non-basement ones don't, which is probably best as a "tag" model that an instance can un/subscribe to
 - Tap on the screen to enable different modes/extended features, like an exercise mode (showing seconds and minimizing weather or other stuff to keep the clock size good) or timer
 - Audio cues
 - Let clock use 24-hour time as a config option (which means no slim leading 1 in those cases, and recalculating the expected width to handling leading 2s + no A/P, which is likely roughly the same)
