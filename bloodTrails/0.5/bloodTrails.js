let bloodTrails = {
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
    // todo: Write function to get blood spatters and pools from library folder automatically
    spatters: [
        //"https://s3.amazonaws.com/files.d20.io/images/6993500/mAA-8agYIwkhEciVVSCFmg/thumb.png?1420411542",
        "https://s3.amazonaws.com/files.d20.io/images/312732953/jO181hhmixoXi4pM1iGhjA/thumb.png?1667632396",

    ],

    pools: [
        //"https://s3.amazonaws.com/files.d20.io/images/6993478/77YowTZze57mGAHfSaxwYg/thumb.png?1420411480",
        "https://s3.amazonaws.com/files.d20.io/images/312732954/WaHBPqcbZC_htgxg6fVGAg/thumb.png?1667632396",

    ],

    chooseBlood: function chooseBlood(type) {
        if (type === "spatter") return bloodTrails.spatters[randomInteger(bloodTrails.spatters.length) - 1];
        if (type === "pool") return bloodTrails.pools[randomInteger(bloodTrails.pools.length) - 1];
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

    createBlood: function createBlood(gPage_id, gLeft, gTop, gWidth, gType, gColor) {
        gLeft = gLeft + (randomInteger(Math.floor(gWidth / 2)) * bloodTrails.getOffset());
        gTop = gTop + (randomInteger(Math.floor(gWidth / 2)) * bloodTrails.getOffset());
        // todo: See if I can make it work with blood animations instead of just graphics
        // todo: See if I can make spatter bigger based on damage received up to a certain max
        // todo: make blood pools surround token on all sides (e.g., if token is medium (5ft square) then pool is 15ft cube)
        setTimeout(function () {
            toFront(createObj("graphic", {
                imgsrc: gType,
                gmnotes: "isBloodTrailsBloodToken",
                pageid: gPage_id,
                left: gLeft,
                tint_color: gColor,
                top: gTop,
                rotation: randomInteger(360) - 1,
                width: gWidth,
                height: gWidth,
                layer: "map",
            }));
        }, 50);
    },

    timeout: 0,

    onTimeout: function theFinalCountdown() {
        if (bloodTrails.timeout > 0) {
            bloodTrails.timeout--;
        }
    },

    setStatusMarker: function setStatusMarker(obj, onOff, status) {
        let currentMarkers = obj.get("statusmarkers").split(',');

        if (currentMarkers.indexOf(status) !== -1 && onOff === false) {
            delete currentMarkers[currentMarkers.indexOf(status)];
            obj.set("statusmarkers", currentMarkers.join(','));
        } else if (currentMarkers.indexOf(status) === -1 && onOff === true) {
            currentMarkers.push(status);
            obj.set("statusmarkers", currentMarkers.join(','));
        }
    },

    setBloodied: function setBloodied(obj) {
        const b3Max = obj.get("bar3_max");
        const b3Value = obj.get("bar3_value");
        const bloodiedThreshold = b3Max - (obj.get("bar3_value") * this.bloodied_percent)

        if (b3Value <= bloodiedThreshold && b3Value > 0) {
            this.setStatusMarker(obj, true, this.bloodied);
        } else if (b3Value > bloodiedThreshold) {
            this.setStatusMarker(obj, false, this.bloodied);
        } else if (b3Value <= 0) {
            this.setStatusMarker(obj, false, this.bloodied);
        }
    },

    setDead: function setDead(obj) {
        const b3Value = obj.get("bar3_value");

        if (b3Value <= 0) {
            this.setStatusMarker(obj, true, this.dead)
        } else {
            this.setStatusMarker(obj, false, this.dead)
        }
    }
};

on("ready", function (obj) {

    setInterval(function () {
        bloodTrails.onTimeout()
    }, 1000);

    // todo: need to rethink this as the obj and prev values don't come into play until the change:graphic:bar3_value event
    // Get values for checks
    let b3Max = obj.get("bar3_max");
    let b3Value = obj.get("bar3_value");
    let b3PrevValue = prev["bar3_value"];
    let noBlood = obj.get("gmnotes").indexOf("noblood") !== -1;
    let onObjectLayer = obj.get("layer") === "objects"
    let bloodThreshold;
    let bloodMultiplier;
    let onSpatter;
    let bloodied;
    let hasLostHp;
    let isDead;
    let eligibleObj = b3Max !== "" || onObjectLayer || !noBlood
    if (eligibleObj) {
        bloodThreshold = obj.get("bar3_max") - (obj.get("bar3_max") * bloodTrails.bloodied_percent);
        bloodMultiplier = 1 + (b3Value - b3PrevValue) / b3Max;
        // todo: come up with better spatter chance formula
        onSpatter = randomInteger(b3Max) > b3Value;
        bloodied = b3Value <= bloodThreshold;
        hasLostHp = b3PrevValue > b3Value;
        isDead = b3Value <= 0;
    }

    on("change:graphic:bar3_value", function (obj, prev) {
        // Set bloodied status
        bloodTrails.setBloodied(obj);
        bloodTrails.setDead(obj);

        // Create Blood Splatter
        if (bloodied && hasLostHp && !isDead && eligibleObj) {
            // Create spatter near token if "bloodied".
            // Chance of spatter depends on severity of damage
            if (onSpatter) {
                bloodMultiplier
                bloodTrails.createBlood(
                    obj.get("_pageid"),
                    obj.get("left"),
                    obj.get("top"),
                    Math.floor(bloodTrails.tokenSize * bloodMult),
                    bloodTrails.chooseBlood("spatter"),
                    bloodTrails.bloodColor(obj.get("gmnotes"))
                );
            }

        } else if (isDead && eligibleObj) {
            // Create pool near token if health drops below 1.
            bloodTrails.createBlood(
                obj.get("_pageid"),
                obj.get("left"),
                obj.get("top"),
                Math.floor(bloodTrails.tokenSize * 1.5),
                bloodTrails.chooseBlood("pool"),
                bloodTrails.bloodColor(obj.get("gmnotes"))
            );
        }
    });

    //Make blood trails, chance goes up depending on how injured a token is
    on("change:graphic:lastmove", function (obj) {
        if (bloodTrails.timeout === 0) {
            if (bloodied && !noBlood && eligibleObj){
                if (onSpatter) {
                    bloodTrails.createBlood(
                        obj.get("_pageid"),
                        obj.get("left"),
                        obj.get("top"),
                        Math.floor(bloodTrails.tokenSize / 2),
                        bloodTrails.chooseBlood("spatter"),
                        bloodTrails.bloodColor(obj.get("gmnotes"))
                    );
                    bloodTrails.timeout += 2;
                }
            }
        }
    });

    // Clear blood
    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content.indexOf("!clearblood") !== -1) {
            if (bloodTrails.useIsGM && !playerIsGM(msg.playerid)) {
                sendChat(msg.who, "/w " + msg.who + " You are not authorized to use that command!");
            } else {
                // todo: fix this who area to only remove the blood tokens. Currently removes blood tokens and tokens that have dropped blood.
                objects = filterObjs(function (obj) {
                    return obj.get("type") === "graphic" && obj.get("gmnotes") === "isBloodTrailsBloodToken";
                });
                _.each(objects, function (obj) {
                    obj.remove();
                });
            }
        }
        // todo: add function to set blood color based on hex value to selected token(s)
        // todo: add function to setup default blood colors into state (e.g., state.bloodTrails.bloodColors = {purple: "#0000ff", blue: "#00ffff"}
        // todo: add function to setup bloodied and dead status marker values
        // todo: add function to setup bloodied hp loss percentage
        // todo: add function to set useIsGM
    });
});
