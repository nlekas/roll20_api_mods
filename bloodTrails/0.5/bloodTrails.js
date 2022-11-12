let bloodTrails = (function () {
    // Bloodied status effect icon name
    let bloodied = "Bloodied::5614630"

    // Dead status effect icon name
    let dead = "dead"

    // Bloodied status applied after losing this percentage of health
    let bloodied_percent = 0.5

    // This value should match the size of a standard grid in your campaign
    // Default is 70 px x 70 px square, Roll20's default.
    let tokenSize = 70

    // If you have it installed, this will plug in TheAaron's isGM auth module,
    // which will make it so only the GM can use the !clearblood command
    // Change to "true" if you want to check for authorization
    let useIsGM = false

    // Blood Multiplier Increase Percentage
    // Want more blood, up the blood multiplier for more blood and guts
    let bloodMultiplierUp = 0

    // YOU MUST ADD YOUR OWN SPLATTERS AND POOLS TO YOUR LIBRARY
    // AND GET THE IMAGE LINK VIA YOUR WEB BROWSER.
    // FOLLOW THE INSTRUCTIONS HERE:
    // https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
    // You can add as many as you'd like to either category.
    // Splatters are also used for blood trails.
    // todo: Write function to get blood splatters and pools from library folder automatically
    let splatters = [
        //"https://s3.amazonaws.com/files.d20.io/images/6993500/mAA-8agYIwkhEciVVSCFmg/thumb.png?1420411542",
        "https://s3.amazonaws.com/files.d20.io/images/312732953/jO181hhmixoXi4pM1iGhjA/thumb.png?1667632396",
        "https://s3.amazonaws.com/files.d20.io/images/313839203/vZhl31mvsXbwSWxOF4Jdgw/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839202/4U_9YxnX-6mJ4w2t8vnEAw/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839200/WpUUiQuQyt29wgPhDRq5uA/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839206/dtb2jOsTqebGaEAPxkOyeA/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839205/lGN7J8ErW9XyL185uAudbQ/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839191/UxlQIQT4WLB0xFCxH9NHvA/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839190/KU_0zHJO2vEe4Ni5lSc3Dg/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839207/XRyad1eOyMJ8NgqTX5bMWQ/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839198/quCNJb6c4-iPOptAIO-i_g/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839204/fZAMQbMOMjmlskMM9_rdXQ/thumb.png?1668236964"
    ]

    let pools = [
        //"https://s3.amazonaws.com/files.d20.io/images/6993478/77YowTZze57mGAHfSaxwYg/thumb.png?1420411480",
        "https://s3.amazonaws.com/files.d20.io/images/312732954/WaHBPqcbZC_htgxg6fVGAg/thumb.png?1667632396",
        "https://s3.amazonaws.com/files.d20.io/images/313839193/l33PVfD98jK12gaGNIaKMg/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839199/ByVBtTMRl54AY7H9SNFbIw/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839196/GlMspEzcP2tK8JShjaqWdg/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839197/qpe6J7tumEGELPk6nVH0Cw/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839194/0lgt5ikCRZNDHpR8fvh5aQ/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839208/AW77uqczNiYfLLieH82bmA/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839201/KvFHYyzPebHtkISn3mesaA/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839189/sitMxuBzduItaLvsR6SlQA/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839192/pr7X_03X9xlt1fImV2U03Q/thumb.png?1668236964",
        "https://s3.amazonaws.com/files.d20.io/images/313839195/axahu47UEk5NETg_HQfG0w/thumb.png?1668236964"


    ]

    function chooseBlood(type) {
        if (type === "splatter") return splatters[randomInteger(splatters.length) - 1];
        if (type === "pool") return pools[randomInteger(pools.length) - 1];
    }

// todo: find what this is used for
    function getOffset() {
        if (randomInteger(2) === 1) return 1;
        else return -1;
    }

    // todo: CRUD system to add color JSON objects to state.bloodTrails.bloodColors[] where JSONs are {"purple_rain": "#0000ff"}
    function bloodColor(gmnotes) {
        if (gmnotes.indexOf("bloodcolor_purple") !== -1) return "#0000ff";
        if (gmnotes.indexOf("bloodcolor_blue") !== -1) return "#00ffff";
        if (gmnotes.indexOf("bloodcolor_orange") !== -1) return "#ffff00";
        else return "transparent"
    }

    function createBlood(gPage_id, gLeft, gTop, gWidth, gType, gColor) {
        gLeft = gLeft + (randomInteger(Math.floor(gWidth / 2)) * getOffset());
        gTop = gTop + (randomInteger(Math.floor(gWidth / 2)) * getOffset());
        // todo: See if I can make it work with blood animations instead of just graphics
        // todo: See if I can make splatter bigger based on damage received up to a certain max
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
    }

    let timeout = 0

    function onTimeout() {
        if (timeout > 0) {
            timeout--;
        }
    }

    function setStatusMarker(obj, onOff, status) {
        let currentMarkers = obj.get("statusmarkers").split(',');

        if (currentMarkers.indexOf(status) !== -1 && onOff === false) {
            delete currentMarkers[currentMarkers.indexOf(status)];
            obj.set("statusmarkers", currentMarkers.join(','));
        } else if (currentMarkers.indexOf(status) === -1 && onOff === true) {
            currentMarkers.push(status);
            obj.set("statusmarkers", currentMarkers.join(','));
        }
    }

    function setBloodied(obj) {
        const b3Max = obj.get("bar3_max");
        const b3Value = obj.get("bar3_value");
        const bloodiedThreshold = b3Max - (b3Max * bloodied_percent)

        if (b3Value <= bloodiedThreshold && b3Value > 0) {
            setStatusMarker(obj, true, bloodied);
        } else if (b3Value > bloodiedThreshold) {
            setStatusMarker(obj, false, bloodied);
        } else if (b3Value <= 0) {
            setStatusMarker(obj, false, bloodied);
        }
    }

    function setDead(obj) {
        const b3Value = obj.get("bar3_value");

        if (b3Value <= 0) {
            setStatusMarker(obj, true, dead)
        } else {
            setStatusMarker(obj, false, dead)
        }
    }

    function processObject(obj, prev = void 0) {
        // Setup logic properties for object
        let procObj = {
            b3Max: obj.get("bar3_max"),
            b3Value: obj.get("bar3_value"),
            noBlood: obj.get("gmnotes").indexOf("noblood") !== -1,
            onObjectLayer: obj.get("layer") === "objects",
            eligibleObj: this.b3Max !== "" || this.onObjectLayer || !this.noBlood,
            missingHp: this.b3Max - this.b3Value,
            bloodThreshold: void 0,
            bloodMultiplier: void 0,
            doSplatter: void 0,
            bloodied: void 0,
            hasLostHp: void 0,
            isDead: void 0,
            b3PrevValue: void 0,
            b3Loss: void 0,
        }

        if (procObj.eligibleObj) {
            procObj.bloodThreshold = obj.get("bar3_max") - (obj.get("bar3_max") * bloodied_percent);
            procObj.bloodied = procObj.b3Value <= procObj.bloodThreshold;
            procObj.isDead = procObj.b3Value <= 0;
            if (prev !== void 0) {
                procObj.b3PrevValue = prev["bar3_value"];
                procObj.b3Loss = procObj.b3PrevValue - procObj.b3Value;
                let baseBloodMultiplier = 1 + (procObj.b3Loss / procObj.b3Max);
                procObj.bloodMultiplier = (baseBloodMultiplier) + (baseBloodMultiplier * bloodMultiplierUp);
                procObj.hasLostHp = procObj.b3PrevValue > procObj.b3Value;

            }
        }

        return procObj;
    }

    function doSplatterFromDmg(procObj) {
        if (procObj.bloodied && procObj.eligibleObj) {
            let change = Math.abs((procObj.b3Value - procObj.b3PrevValue) / procObj.b3PrevValue);
            let threshold = (change * 100);
            return randomInteger(100) <= threshold;
        } else {
            return false;
        }
    }

    function doSplatterAfterMove(procObj) {
        if (procObj.eligibleObj && procObj.bloodied) {
            return randomInteger(procObj.b3Max) >= procObj.b3Value
        } else {
            return false;
        }
    }

    on("ready", function (obj) {

        setInterval(function () {
            onTimeout()
        }, 1000);

        on("change:graphic:bar3_value", function (obj, prev) {
            // Set bloodied status
            setBloodied(obj);
            setDead(obj);
            let procObj = processObject(obj, prev)
            // Create Blood Splatter
            if (procObj.bloodied && procObj.hasLostHp && !procObj.isDead && procObj.eligibleObj) {
                // Create splatter near token if "bloodied".
                // Chance of splatter depends on severity of damage
                if (doSplatterFromDmg(procObj)) {
                    createBlood(
                        obj.get("_pageid"),
                        obj.get("left"),
                        obj.get("top"),
                        Math.floor(tokenSize * procObj.bloodMultiplier),
                        chooseBlood("splatter"),
                        bloodColor(obj.get("gmnotes"))
                    );
                }

            } else if (procObj.isDead && procObj.eligibleObj) {
                // Create pool near token if health drops below 1.
                createBlood(
                    obj.get("_pageid"),
                    obj.get("left"),
                    obj.get("top"),
                    Math.floor(tokenSize * 3),
                    chooseBlood("pool"),
                    bloodColor(obj.get("gmnotes"))
                );
            }
        });

        //Make blood trails, chance goes up depending on how injured a token is
        on("change:graphic:lastmove", function (obj) {
            let procObj = processObject(obj)
            if (timeout === 0) {
                if (procObj.bloodied && procObj.eligibleObj && !procObj.isDead) {
                    // todo: look at lastmove and top/bottom values of token to get movement with waypoints. Further moved the more bloodied you are the more blood you drop
                    // get percentage of movement used from either character sheet or from base value of 30 feet. More movement used = higher percentage.
                    // Multiply percentage by 100 and roll randomInteger(100). If roll is between 0 and percentage used, drop blood
                    if (doSplatterAfterMove(procObj)) {
                        createBlood(
                            obj.get("_pageid"),
                            obj.get("left"),
                            obj.get("top"),
                            Math.floor(tokenSize),
                            chooseBlood("splatter"),
                            bloodColor(obj.get("gmnotes"))
                        );
                        timeout += 2;
                    }
                }
            }
        });

        // Clear blood
        on("chat:message", function (msg) {
            if (msg.type === "api" && msg.content.indexOf("!clearblood") !== -1) {
                if (useIsGM && !playerIsGM(msg.playerid)) {
                    sendChat(msg.who, "/w " + msg.who + " You are not authorized to use that command!");
                } else {
                    let objects = filterObjs(function (obj) {
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

    return {
        chooseBlood: chooseBlood,
        getOffset: getOffset,
        bloodColor: bloodColor,
        createBlood: createBlood,
        onTimeout: onTimeout,
        setStatusMarker: setStatusMarker,
        setBloodied: setBloodied,
        setDead: setDead,
        processObject: processObject,
        doSplatterFromDmg: doSplatterFromDmg,
        doSplatterAfterMove: doSplatterAfterMove,
    }
})();


