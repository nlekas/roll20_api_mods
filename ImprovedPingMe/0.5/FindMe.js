on("chat:message",function(msg){
    if(msg.type==="api" && msg.content.indexOf("!findMe")===0){
        let rawCharacterList = findObjs({type:"character"});
        let character, playerId, controlledBy;
        let characterList = [];
        let current_player = msg.playerid;
        for (character of rawCharacterList) {
            controlledBy = character.get("controlledby");
            if (controlledBy === "") {
                continue;
            }
            if (controlledBy.indexOf(",") !== -1) {
                let controllers = controlledBy.split(",");
                for (playerId of controllers) {
                    if (playerId === current_player) {
                        characterList.push(character)
                    }
                }
            } else {
                if (controlledBy === current_player) {
                    characterList.push(character);
                }

            }
        }
        log(characterList)
        let playerName = getObj("player",msg.playerid).get("displayname");
        if(characterList.length===1){
            sendChat("FindMeApi","!findCharacter " + characterList[0].get("id") + " " + msg.playerid + " " + playerName);
        }
        else{
            var pingList="";
            _.each(characterList,function(character){
                pingList+='<a href="!findCharacter ' + character.get("id") + ' ' + msg.playerid + ' ' + playerName + '">' + character.get("name") +'</a>';
            });
            sendChat("FindMeApi","/w " + playerName + " Which character?<br/>"+pingList);

        }
    }
});

on("chat:message",function(msg){
    if(msg.type==="api" && msg.content.indexOf("!findCharacter")===0){
        let args = msg.content.split(" ");
        let characterID = args[1];
        let playerID = args[2];
        let playerName = args[3];
        let playerToken = findObjs({
            type:"graphic",
            subtype:"token",
            represents:characterID,
            pageid:Campaign().get("playerpageid")
        })[0];

        if(playerToken===undefined){
            sendChat("FindMeApi","/w " + playerName + " That character is not on the map.");
            return;
        }

        sendPing(playerToken.get("left"),playerToken.get("top"),playerToken.get("pageid"),playerID,true,playerID);
    }
});
