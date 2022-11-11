/////////////////////////////////////////////////
/***********************************************/
var BloodAndHonor = {
    author: {
        name: "John C." || "Echo" || "SplenectomY",
        company: "Team Asshat" || "The Alehounds",
        contact: "echo@TeamAsshat.com",
    },
    version: "0.8.1", // The Aaron - Patched for playerIsGM(), createObj(), and randomInteger() crash.
    gist: "https://gist.github.com/SplenectomY/097dac3e427ec50f32c9",
    forum: "https://app.roll20.net/forum/post/1477230/",
    wiki: "https://wiki.roll20.net/Script:Blood_And_Honor:_Automatic_blood_spatter,_pooling_and_trail_effects",
    /***********************************************/
/////////////////////////////////////////////////
    // Bloodied status effect icon name
    bloodied: "Bloodied::5614630",
    // Dead status effect icon name
    dead: "dead",
    // Bloodied status applied after losing this percentage of health
    bloodied_percent: 0.5,
    // This value should match the size of a standard grid in your campaign
    // Default is 70 px x 70 px square, Roll20's default.
    tokenSize: 70,

    // If you have it installed, this will plug in TheAaron's isGM auth module,
    // which will make it so only the GM can use the !clearblood command
    // Change to "true" if you want to check for authorization
    useIsGM: false,

    // YOU MUST ADD YOUR OWN SPATTERS AND POOLS TO YOUR LIBRARY
    // AND GET THE IMAGE LINK VIA YOUR WEB BROWSER.
    // FOLLOW THE INSTRUCTIONS HERE:
    // https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
    // You can add as many as you'd like to either category.
    // Spatters are also used for blood trails.
    spatters: [
        //"https://s3.amazonaws.com/files.d20.io/images/6993500/mAA-8agYIwkhEciVVSCFmg/thumb.png?1420411542",
        "https://s3.amazonaws.com/files.d20.io/images/312732953/jO181hhmixoXi4pM1iGhjA/thumb.png?1667632396",

    ],
    pools: [
        //"https://s3.amazonaws.com/files.d20.io/images/6993478/77YowTZze57mGAHfSaxwYg/thumb.png?1420411480",
        "https://s3.amazonaws.com/files.d20.io/images/312732954/WaHBPqcbZC_htgxg6fVGAg/thumb.png?1667632396",

    ],
    chooseBlood: function chooseBlood(type) {
        if (type === "spatter") return BloodAndHonor.spatters[randomInteger(BloodAndHonor.spatters.length) - 1];
        if (type === "pool") return BloodAndHonor.pools[randomInteger(BloodAndHonor.pools.length) - 1];
    },
    getOffset: function getOffset() {
        if (randomInteger(2) === 1) return 1;
        else return -1;
    },
    bloodColor: function bloodColor(gmnotes) {
        if (gmnotes.indexOf("bloodcolor_purple") !== -1) return "#0000ff";
        if (gmnotes.indexOf("bloodcolor_blue") !== -1) return "#00ffff";
        if (gmnotes.indexOf("bloodcolor_orange") !== -1) return "#ffff00";
        else return "transparent"
    },
    createBlood: function createBlood(gPage_id,gLeft,gTop,gWidth,gType,gColor) {
        gLeft = gLeft + (randomInteger(Math.floor(gWidth / 2)) * BloodAndHonor.getOffset());
        gTop = gTop + (randomInteger(Math.floor(gWidth / 2)) * BloodAndHonor.getOffset());
        setTimeout(function(){
            toFront(createObj("graphic",{
                imgsrc: gType,
                gmnotes: "blood",
                pageid: gPage_id,
                left: gLeft,
                tint_color: gColor,
                top: gTop,
                rotation: randomInteger(360) - 1,
                width: gWidth,
                height: gWidth,
                layer: "map",
            }));
        },50);
    },
    timeout: 0,
    onTimeout: function theFinalCountdown() {
        if (BloodAndHonor.timeout > 0) {
            BloodAndHonor.timeout--;
        } else {
            return;
        }
    },

    setStatusMarker: function setStatusMarker(obj, onOff, status){
        let currentMarkers = obj.get("statusmarkers").split(',');

        if(currentMarkers.indexOf(status) !== -1 && onOff === false){
            delete currentMarkers[currentMarkers.indexOf(status)];
            obj.set("statusmarkers", currentMarkers.join(','));
        } else if(currentMarkers.indexOf(status) === -1 && onOff === true){
            currentMarkers.push(status);
            obj.set("statusmarkers", currentMarkers.join(','));
        }
    },

    setBloodied: function setBloodied(obj) {
        const b3Max = obj.get("bar3_max");
        const b3Value = obj.get("bar3_value");
        const lossToBloodied = obj.get("bar3_value") * this.bloodied_percent;
        const bloodiedThreshold = b3Max - lossToBloodied
        if(b3Value <= bloodiedThreshold && b3Value > 0) {
            this.setStatusMarker(obj, true, this.bloodied);
        } else if(b3Value > bloodiedThreshold){
            this.setStatusMarker(obj, false, this.bloodied);
        } else if(b3Value <= 0) {
            this.setStatusMarker(obj, false, this.bloodied);
        }
    },

    setDead: function setDead(obj) {
        const b3Value = obj.get("bar3_value");

        if(b3Value <= 0) {
            this.setStatusMarker(obj, true, this.dead)
        } else {
            this.setStatusMarker(obj, false, this.dead)
        }
    }
};

on("ready", function(obj) {

    setInterval(function(){BloodAndHonor.onTimeout()},1000);

    on("change:graphic:bar3_value", function(obj, prev) {
        // Set bloodied status
        BloodAndHonor.setBloodied(obj);
        BloodAndHonor.setDead(obj);

        // Create Blood Splatter
        if (obj.get("bar3_max") === "" || obj.get("layer") !== "objects" || (obj.get("gmnotes")).indexOf("noblood") !== -1) {
            // Do nothing
        } else if (obj.get("bar3_value") <= obj.get("bar3_max") / 2 && prev["bar3_value"] > obj.get("bar3_value") && obj.get("bar3_value") > 0) {
            // Create spatter near token if "bloodied".
            // Chance of spatter depends on severity of damage
            if (randomInteger(obj.get("bar3_max")) > obj.get("bar3_value")) {
                var bloodMult = 1 + ((obj.get("bar3_value") - prev["bar3_value"]) / obj.get("bar3_max"));
                BloodAndHonor.createBlood(obj.get("_pageid"), obj.get("left"), obj.get("top"), Math.floor(BloodAndHonor.tokenSize * bloodMult), BloodAndHonor.chooseBlood("spatter"), BloodAndHonor.bloodColor(obj.get("gmnotes")));
            }
            // Create pool near token if health drops below 1.
        } else if (obj.get("bar3_value") <= 0) {
            BloodAndHonor.createBlood(obj.get("_pageid"), obj.get("left"), obj.get("top"), Math.floor(BloodAndHonor.tokenSize * 1.5), BloodAndHonor.chooseBlood("pool"), BloodAndHonor.bloodColor(obj.get("gmnotes")));
        }
    });

//Make blood trails, chance goes up depending on how injured a token is
    on("change:graphic:lastmove", function(obj) {
        if (BloodAndHonor.timeout === 0) {
            if (obj.get("bar3_value") <= obj.get("bar3_max") / 2 && (obj.get("gmnotes")).indexOf("noblood") === -1) {
                if (randomInteger(obj.get("bar3_max")) > obj.get("bar3_value")) {
                    BloodAndHonor.createBlood(obj.get("_pageid"), obj.get("left"), obj.get("top"), Math.floor(BloodAndHonor.tokenSize / 2), BloodAndHonor.chooseBlood("spatter"), BloodAndHonor.bloodColor(obj.get("gmnotes")));
                    BloodAndHonor.timeout += 2;
                }
            }
        }
    });

    on("chat:message", function(msg) {
        if (msg.type === "api" && msg.content.indexOf("!clearblood") !== -1) {
            if (BloodAndHonor.useIsGM && !playerIsGM(msg.playerid)) {
                sendChat(msg.who,"/w " + msg.who + " You are not authorized to use that command!");
            } else {
                objects = filterObjs(function(obj) {
                    if(obj.get("type") === "graphic" && obj.get("gmnotes") === "blood") return true;
                    else return false;
                });
                _.each(objects, function(obj) {
                    obj.remove();
                });
            }
        }
    });
});
