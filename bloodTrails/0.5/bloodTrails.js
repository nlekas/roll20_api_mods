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
    bloodied: "Bloodied",
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
        //"https://s3.amazonaws.com/files.d20.io/images/312732953/jO181hhmixoXi4pM1iGhjA/thumb.png?1667632396",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398918/HKAC0lHSSVd7kX0DrbD8sw/med.webm?1651061388",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398920/gJCIJxm7UAt5hVba530csQ/med.webm?1651061442",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398922/vQdRym_NM0lE7DJGLq8HlA/med.webm?1651061493",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398924/SVT09MIMtVKpB8QwkTQ9Rw/med.webm?1651061548",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398926/lTiJBhVjx34d2vWa5mugvQ/med.webm?1651061591",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398928/WsKre8AXb0dq3T1QMYbw3g/med.webm?1651061641",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398930/jr28SFGJUqkLWEnDt6AQQA/med.webm?1651061672",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398932/O0n_yaELMhMhdSd-cxf3ZA/med.webm?1651061705",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398934/mUq6nc3BI1zG_CtJdPNBHQ/med.webm?1651061758",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398936/YotEnEVyz1Fvd0j_Ny-VTw/med.webm?1651061817",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398938/wJoONxF_pWmeuZUH6xvttQ/med.webm?1651061832",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398940/VU0FLObbcqR6FfpYPi7SlA/med.webm?1651061847",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398942/8nfFFG8iMXvsYVKuDfokCw/med.webm?1651061889",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398944/12n55uzeHtk6GZSa5wKlnQ/med.webm?1651061934",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398946/4h3Peme91GuDIiBTJITTmQ/med.webm?1651061962",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398948/Rcv4eqIO1hRguo_248nzag/med.webm?1651061992",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398950/E-0Q9p8XNer5HTmFAmc5zw/med.webm?1651062022",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398952/r5Z-GjIPYpEG-TxVs1d8cg/med.webm?1651062057",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398954/R5mvl9ce-yefZ9tFrQsbLA/med.webm?1651062087",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398956/mX_Mj6qvfwZqwFF1p5yS5w/med.webm?1651063534",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398958/LgsgCpVtG8rYKUP12ClRWw/med.webm?1651063563",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398960/kLcFMRWpA9hornYQpX6A8g/med.webm?1651063596",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398962/2OHLW75tYvYXsEoHbqI03w/med.webm?1651063620",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398964/c__xoTZiFPuONTjXyp4cyQ/med.webm?1651063647",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398966/iQSSzCebRS1DjYQ8TxPHnA/med.webm?1651063662",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398968/vd2fpGHrMbdn6CizB3Hshg/med.webm?1651063678",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398970/s8CbRtybFzpKy0Dx3Y82Mw/med.webm?1651063702",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398972/YSD8dl5XpONLf-52pZ9uow/med.webm?1651063731",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398974/c0HZcyVKvcOmEuyeRHb6gA/med.webm?1651063771",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398976/bhdwoIgflIlhyR0cDpZj3Q/med.webm?1651063815",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398978/9QlySc8Z1QlXOdiYa8RdWQ/med.webm?1651063836",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398980/DKoPbd_xSrVyBU3YAZQTCw/med.webm?1651063861",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398982/IEtL_0JSIuVf_gHImjVv8w/med.webm?1651063896",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398984/UROrV2PQXge7WM85v_px8A/med.webm?1651063935",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398986/FVGiDVtnCjTv5wZ-1XrLiQ/med.webm?1651063951",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398988/Pmi71Zib9Yk02hzQecQnqw/med.webm?1651063970",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398990/ea0MOaqF4ZHNwpCF6TwagQ/med.webm?1651064019",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398992/k29LE5KSelMDM-q0u97pWw/med.webm?1651064077",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398994/TnL0mKDZcnr9kYPY6Fauhg/med.webm?1651064111"
    ],
    pools: [
        //"https://s3.amazonaws.com/files.d20.io/images/6993478/77YowTZze57mGAHfSaxwYg/thumb.png?1420411480",
        //"https://s3.amazonaws.com/files.d20.io/images/312732954/WaHBPqcbZC_htgxg6fVGAg/thumb.png?1667632396",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395754/LHpKgifiz96BqIIm4xzzLw/med.webm?1650793435",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395756/fI2yZgZIOoLIL7zCyXQz8A/med.webm?1650793482",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395758/o2N_t4JkcNs7xQf0SMGqVQ/med.webm?1650793533",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395760/VZmFnpiIMEhuFxziHGRCdg/med.webm?1650793582",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395762/9YwW4zvy4JV93ljIYI2GDQ/med.webm?1650793634",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395764/L9h2dP1VxJdwoi_qItC9pw/med.webm?1650793687",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395766/mhinn-tOqFQZl0F8njoFIA/med.webm?1650793744",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395768/yQdMEm1lUonoSClOqSXNWg/med.webm?1650793798",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395771/fx7ZgE4hc_SytmFRweTvSw/med.webm?1650793850",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2395780/NCcaa9KzrwqnINyliOQtuA/med.webm?1650793901",
        "https://s3.amazonaws.com/files.d20.io/marketplace/2398916/ALBFl24O4m_sAAKM39O38Q/med.webm?1651061308"
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

    setBloodiedStatus: function setBloodiedStatus(obj, onOff){
        let status_marker = "status_" + this.bloodied
        if(obj.get(status_marker) && !onOff){
            obj.set(status_marker, false)
        } else if(!obj.get(status_marker) && onOff){
            obj.set(status_marker, true)
        }
    }
};

on("ready", function(obj) {

    setInterval(function(){BloodAndHonor.onTimeout()},1000);

    on("change:graphic:bar3_value", function(obj, prev) {
        // Set bloodied status
        if(obj.get("bar3_value") <= obj.get("bar3_max") - (obj.get("bar3_max") * BloodAndHonor.bloodied_percent)) {
            BloodAndHonor.setBloodiedStatus(obj, true);
        } else if(obj.get("bar3_value") > obj.get("bar3_max") - (obj.get("bar3_max") * BloodAndHonor.bloodied_percent)){
            BloodAndHonor.setBloodiedStatus(obj, false);
        }

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
            if (obj.get("bar3_value") <= obj.get("bar3_max") / 2 && (obj.get("gmnotes")).indexOf("noblood") == -1) {
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
