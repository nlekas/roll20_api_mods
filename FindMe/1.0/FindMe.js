function pingPlayer(characterId, playerId, playerName) {
    let playerToken = findObjs({
        type: "graphic",
        subtype: "token",
        represents: characterId,
        pageid: Campaign().get("playerpageid")
    })[0];

    if (playerToken === undefined) {
        sendChat("FindMeApi", "/w " + playerName + " That character is not on the map.");
        return;
    }

    sendPing(playerToken.get("left"), playerToken.get("top"), playerToken.get("pageid"), playerId, true, playerId);
}

function getCharacterList(currentPlayer) {
    let rawCharacterList = findObjs({type: "character"});
    let character, playerId, controlledBy;
    let characterList = [];
    for (character of rawCharacterList) {
        controlledBy = character.get("controlledby");
        if (controlledBy === "") {
            continue;
        }
        if (controlledBy.indexOf(",") !== -1) {
            let controllers = controlledBy.split(",");
            for (playerId of controllers) {
                if (playerId === currentPlayer) {
                    characterList.push(character);
                }
            }
        } else {
            if (controlledBy === currentPlayer) {
                characterList.push(character);
            }

        }
    }
    return characterList
}

function getPlayerFromName(playerName){
    let returnPlayer;
    const players = findObjs({_type: 'player'});
    _.each(players, function(player){
        if(player.get("displayname") === playerName){
            returnPlayer = player
        }
    });
    return returnPlayer
}


on("chat:message", function (msg) {
    if (msg.type === "api" && msg.content.indexOf("!findMe") === 0) {
        let characterList = getCharacterList(msg.playerid);
        let playerName = getObj("player", msg.playerid).get("displayname");
        if (characterList.length === 1) {
            pingPlayer(characterList[0].get("id"), msg.playerid, playerName)
        } else {
            var pingList = "";
            _.each(characterList, function (character) {
                pingList += '<a href="!findCharacter|' + character.get("id") + '|' + msg.playerid + '|' + playerName + '">' + character.get("name") + '</a>';
            });
            sendChat("FindMeApi", "/w " + playerName + " Which character?<br/>" + pingList);

        }

    } else if (msg.type === "api" && msg.content.indexOf("!findCharacter") === 0) {
        let args = msg.content.split("|");
        args.shift()
        let characterID = args[0];
        let playerID = args[1];
        let playerName = args[2];

        pingPlayer(characterID, playerID, playerName)

    } else if (msg.type === "api" && msg.content.indexOf("!pingPlayer") === 0) {
        let playerNames = msg.content.split("|")
        playerNames.shift()
        let characterList;
        let player;
        let characterId;
        let playerId;
        _.each(playerNames, function(playerName){
            player = getPlayerFromName(playerName);
            playerId = player.get("id")
            characterList = getCharacterList(playerId);
            _.each(characterList, function(character){
                characterId = character.get("id")
                pingPlayer(characterId, playerId, playerName)
            });
        });
    }
});