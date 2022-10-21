let errors = 0;

function isTableTop (tableTops, playerId){
    let output = false;
    _.each(tableTops, function (tt) {
        if(tt.playerId === playerId){
            output = true
        }
    });
    return output
}


function parseTableTops(msg, playerObjs) {
    const tableTopNames = msg.content.split(" ");
    tableTopNames.shift();
    let tableTops = [];
    let row;
    _.each(tableTopNames, function(tt) {
        _.each(playerObjs, function(p) {
           if(p.get('displayname') === tt){
               row = {
                   name: tt,
                   playerId: p.get("id"),
               }
           }
        });

        tableTops.push(row)
    });
    return tableTops;
}


function findControllingTableTop(tableTops, characterObj) {
    let controllersFound = {};
    const controllers = characterObj.get('controlledby').split(",");
    _.each(controllers, function(controller){
        _.each(tableTops, function(tt) {
           if( controller === tt.playerId){
               controllersFound.push(controller)
           }
        });
    });
    if(controllersFound.length() > 1) {
        sendChat("Lighting Setup", "Found multiple controlling table tops for character " + characterObj.get('name') + ". Please remove tabletops until it is only controlled by one.")
        errors++;
    }
    return controllersFound[0]
}


function isControlledByPlayer(characterObj, playerId){
    let output = false;
    const controllers = characterObj.get('controlledby').split(",");
    _.each(controllers, function(controller) {
       if(controller === playerId){
           output = true;
       }
    });
    return output;
}


function findPlayerCharacters (playerObj){
    let playerCharacters = [];
    const characterObjs = findObjs({_type: 'character'});

    _.each(characterObjs, function(character) {
      if(isControlledByPlayer(character, playerObj.get('id'))){
          playerCharacters.push(character);
      }
   });
    if(playerCharacters.length === 0){
        sendChat("Lighting Setup", "Cannot find any characters for player " + playerObj.get("displayname") + ". Please give this player control of a character.");
        errors++;
    }
    return playerCharacters;
}


function parsePlayers(allPlayerObjs, tableTops) {
    let players = [];
    let row;
    let controllingTableTop;
    let characters;
    let controllingTabletops = {};
    _.each(allPlayerObjs, function(p) {
        if(!playerIsGM(p.get('id'))) {
            if (!isTableTop(tableTops, p.get('id'))) {
                characters = findPlayerCharacters(p);

                _.each(characters, function(c){
                    controllingTabletops.push(findControllingTableTop(c));
                });

                if(controllingTabletops.length() > 1) {
                    sendChat("Lighting Setup", "Found multiple controlling table tops for player " + p.get('displayname') + ". Please remove tabletops from that player's characters until they are only controlled by one.")
                    errors++;
                }

                controllingTableTop = controllingTabletops[0];

                row = {
                    playerName: p.get('displayname'),
                    playerId: p.get('id'),
                    tableTop: controllingTableTop,
                    characters: characters
                };
                players.push(row);
            }
        }
    });
    return players;
}

on("chat:message",function(msg){
    if(msg.type==="api" && msg.content.indexOf("!setupLighting")===0){
        errors = 0;
        const allPlayerObjs = findObjs({_type: 'player'});
        const tableTops = parseTableTops(msg, allPlayerObjs);
        const players = parsePlayers(allPlayerObjs, tableTops);
        log(players)
        log(tableTops)
        if(!state.cleanPlayerControlState) state.cleanPlayerControlState = {};
        state.cleanPlayerControlState = players;
        }
});


on("chat:message",function(msg){
    if(msg.type==="api" && msg.content.indexOf("!resetLighting")===0){
        state.cleanPlayerControlState = {}
    }
});


on("change:campaign:turnorder", function (current, previous) {

    const CurrentTO = JSON.parse(current.get("turnorder"));
    const PreviousTO = JSON.parse(previous["turnorder"]);
    let Token;
    let Character;

    // Save F2F data...
    if (!state.f2f) state.f2f = {};
    if (_.isEmpty(state.f2f)) {
        _.each(CharacterIds, function (charid) {
            Character = getObj("character", charid);
            state.f2f[charid] = {
                CharacterID: charid,
                ControlledBy: Character.get("controlledby")
            }
        });
    }

    // Process the turn order...
    if (CurrentTO.length > 0) {
        _.each(state.f2f, function (a) {
            // todo: set controlled by to player(s) ids not table tops.
            getObj("character", a["CharacterID"]).set("controlledby", "");
        });
        if (CurrentTO[0].id !== -1) Token = getObj("graphic", CurrentTO[0].id);
        if (CurrentTO[0].id !== -1 && Token.get("represents") !== "") Character = getObj("character", Token.get("represents"));
        // tODO: Loop on new player/character array and check if character is in array
        // todo: store table tops that control the character
        if (CurrentTO[0].id !== -1 && Token.get("represents") !== "" && Character.id in state.f2f) {
            // todo: set to be controlled by player(s) & table tops that control character
            Character.set("controlledby", state.f2f[Character.id]["ControlledBy"]);
        } else {
            // Return control to all players during npc and custom item turns...
            _.each(state.f2f, function (b) {
                // todo: restore original array view
                getObj("character", b["CharacterID"]).set("controlledby", b["ControlledBy"]);
            });
        }
    } else {
        // Turn order tracker is empty. Return control to all players...
        _.each(state.f2f, function (z) {
            // todo: restore original array view
            getObj("character", z["CharacterID"]).set("controlledby", z["ControlledBy"]);
        });
        state.f2f = {};

    }

    // Simple Initiative Tracker (Green Dot)...
    if (CurrentTO.length === 0 && PreviousTO[0].id !== -1) getObj("graphic", PreviousTO[0].id).set("status_green", false);
    if (CurrentTO.length > 0 && CurrentTO[0].id !== -1) getObj("graphic", CurrentTO[0].id).set("status_green", true);
    if (PreviousTO.length > 0 && PreviousTO[0].id !== -1) getObj("graphic", PreviousTO[0].id).set("status_green", false);
});