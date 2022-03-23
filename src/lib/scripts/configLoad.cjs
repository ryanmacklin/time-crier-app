import { Time, General } from '$lib/scripts/utils.cjs';
import { ClockClass } from '$lib/scripts/clockClass.cjs';
//import { NotificationsClass } from '$lib/scripts/notificationsClass.cjs';

export class Config {
    static get maxFreshness() { return 600; } // in seconds
    static get freshnessOnFail() { return 15; } // in seconds

    static get freshConfig(){ // a blank config file with just white as the default clock color
        return {
            "updateId": "",
            "colorPresets": {},
            "clockColors": {
                "default": "",
                "schedule": []
            },
            "notifications": {
                "logic": {}, 
                "schedule": []
            }
        };
    }

    constructor() {
        this.loading = false;
        this.ready = false;
        this.config = Config.freshConfig;
        this.freshnessCount = 0;
        this.configFile = "/config.json";
        //this.newconfig = Config.freshConfig;

        this.configMaxFreshness = 10; // 300 seconds/5 minutes for live; TODO can we make it happen more often in dev?
        this.configMalloadCount = 0;
    }

    get data() {return this.config}

    fetchIfStale() { // assumes being called per second
        if (!this.loading) {
            if (this.freshnessCount <= 0) {
                return this.fetch();
            } else {
                this.freshnessCount--;
            }
        }
        return false;
    }

    async fetch() {
        if (this.loading) {return;} // stop because there's already some attempt at loading (I think?)
        General.log("fetching config file");
        this.loading = true;
        let response = await fetch(this.configFile);
        let promise = response.json();
        promise.then(data => {
            if (data.updateId != this.config.updateId) { // go ahead and load a new config
                General.log("new config file found!");
                let newconfig = Config.freshConfig;
                // updateId
                newconfig.updateId = data.updateId;

                // colorPresets
                newconfig.colorPresets = data.colorPresets;
                
                // default clock color
                newconfig.clockColors.default = data.clockColors.default || ClockClass.defaultColor;
                // calculate clock colors
                //newconfig.clockColors.minutes[1392] = "blue";
                if (data.clockColors.schedule) {
                    newconfig.clockColors.schedule = this.calculateColorSchedule(data.clockColors.schedule, newconfig);
                }

                // assign notification logic & compile upcoming time
                if (data.notifications) {
                    newconfig.notifications.logic = data.notifications;
                }

                // Okay, we can replace the config now
                this.config = newconfig;
                this.freshnessCount = Config.maxFreshness;
                this.configMalloadCount = 0;
                this.loading = false;
                this.ready = true; // only set here, don't set false elsewhere; this assumes the current config is readl
                // And set the color now
                //clockColor = getClockColor(); // THIS NEEDS TO HAPPEN AT SOME POINT
                General.log("config file updated");
                return true;
            } else {
                General.log("no updated needed");
                this.freshnessCount = Config.maxFreshness;
                this.configMalloadCount = 0;
                this.loading = false;
            }
        })
        .catch(reason => { // TODO: better UX for when error happens
            this.configMalloadCount++;
            let m = reason.message;
            m = "Config file: " + reason.message + " (" + this.configMalloadCount + " failed load) [" + (new Date).toLocaleString() + "]";
            console.error(m);
            //errorMessage = m;
            this.freshnessCount = Config.freshnessOnFail; // try again in 15 seconds
            this.loading = false;
        });
        return false;
    }
    
    calculateColorSchedule(con, col = this.config) {
        let res = [];
        con.forEach(i => {
            // get times
            let tag = i.tag || ""; // not bothering with tags right now, even though they're in the config as placeholders, but they're useful in debugging
            //console.log(tag);

            let startTime = Time.miltime2minutes(i.startTime);
            let endTime = Time.miltime2minutes(i.endTime);
            if (endTime < startTime) endTime += 1440; // to handle time spanning midnight

            if (i.color) {
                let color = General.getColorComponenets(i.color); // just to check color
                color = i.color; // if it got here, the color's okay
                for (let i = startTime; i <= endTime; i++) {
                    res[i % 1440] = this.getColor(color, col);
                }
            } else if (i.startColor && i.endColor) {
                let startColor = General.getColorComponenets(this.getColor(i.startColor, col));
                let endColor = General.getColorComponenets(this.getColor(i.endColor, col));
                for (let i = startTime; i <= endTime; i++) {
                    let r = Math.round(startColor.r + ( (endColor.r - startColor.r) * ((i - startTime) / (endTime - startTime)) ));
                    let g = Math.round(startColor.g + ( (endColor.g - startColor.g) * ((i - startTime) / (endTime - startTime)) ));
                    let b = Math.round(startColor.b + ( (endColor.b - startColor.b) * ((i - startTime) / (endTime - startTime)) ));
                    let s = "#";
                    s += (r < 16 ? "0" : "") + r.toString(16);
                    s += (g < 16 ? "0" : "") + g.toString(16);
                    s += (b < 16 ? "0" : "") + b.toString(16);
                    res[i % 1440] = s.toUpperCase();
                }
            } else {
                throw "Invalid color schedule entry for tag \"" + tag + "\"";
                // error!
            }
        });
        //console.log(res);
        return res;
    }

    // color calc functions
    getColor(x, col = this.config) {
        // TODO handle error!
        if (x.substring(0,1) == "%") {
            x = x.substring(1);
            if (x == "default") {
                return col.clockColors.default;
            } else {
                try {
                    return col.colorPresets[x];
                }
                catch {
                    throw '"' + x + "\" isn't a listed preset color";
                }
            }
        }
        return x; // doesn't need transation
    }

    currentClockColor(minuteOfDay) { // pass time.minuteOfDay
        if (this.ready) {
            // not bothering with tags right now, even though they're in the config as placeholders. so this is pretty simple
            let c = this.config.clockColors.schedule[minuteOfDay] || this.config.clockColors.default || ClockClass.defaultColor;
            //console.log(c);
            return c;
        }
        return ClockClass.defaultColor;
    }
} // end class