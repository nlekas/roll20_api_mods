let errors = 0;


function parseTableTops(tableTopNames) {
    const playerObjs = findObjs({_type: 'player'});
    let tableTops = [];
    let row;
    _.each(tableTopNames, function (tableTop) {
        _.each(playerObjs, function (player) {
            if (player.get('displayname') === tableTop) {
                row = {
                    name: tableTop,
                    playerId: player.get("id"),
                }
            }
        });

        tableTops.push(row)
    });
    return tableTops;
}


function isTableTop(tableTops, playerId) {
    let output = false;
    _.each(tableTops, function (tableTop) {
        if (tableTop.playerId === playerId) {
            output = true
        }
    });
    return output
}


function buildCleanPlayerControlState(playerNames, tableTopNames) {
    let name;
    let characterId;
    let playerControllers = [];
    let tableTopId;
    let controllers;
    let tableTops = parseTableTops(tableTopNames);
    let row;

    const characters = findObjs({_type: 'character'});
    _.each(characters, function(character){
        _.each(playerNames, function(playerName){
            if(playerName === character){
                name = character.get("name")
                characterId = character.get("id")
                controllers = character.get('controlledby').split(",");
                _.each(controllers, function(controller){
                    if(isTableTop(tableTops, controller)){
                        if(!tableTopId){
                            tableTopId = controller;
                        } else {
                            sendChat("Lighting Setup", "Found multiple controlling tabletops for " + name + ". Please only have 1 controlling tabletop per character.");
                            errors++;
                        }
                    } else {
                        playerControllers.push(controller);
                    }
                });
                row = {
                    name: name,
                    characterId: characterId,
                    playerControllersIds: playerControllers,
                    tableTopId: tableTopId
                };
                // todo: Why is execution not reaching here and we are ending up with an empty character array
                state.cleanPlayerControlState.characters.push(row);
            }
        });
    });
}


function parseRegisterMsg(msg, source) {
    if (msg.content.indexOf("|") > 0) {
        const items = msg.content.split("|");
        items.shift();
        return items
    } else {
        let typeOfArgs = "";
        if (source === "registerPlayers") typeOfArgs = "player names";
        if (source === "registerTableTops") typeOfArgs = "table top names";
        sendChat("Lighting Setup", "No arguments passed to " + source + ". Please pass " + typeOfArgs + " to " + source + " separated by pipes");
        errors++;
    }
}


function initRegistry(reset) {
    if (!state.registry) state.registry = {"tableTopsNames": [], "playerCharacterNames": []};
    if (reset) state.registry = {"tableTopsNames": [], "playerCharacterNames": []};
}


function initCleanPlayerControlState(reset) {
    if (!state.registry) state.cleanPlayerControlState = {"characters": []};
    if (reset) state.cleanPlayerControlState = {"characters": []};
}


function getTurnControllers(character, tabletops, players) {
    let controlledBy = ""

    if (players) {
        _.each(character.playerControllerIds, function (controllerPlayer) {
            controlledBy += "," + controllerPlayer;
        });
    }

    if (tabletops) {
        controlledBy += "," + character.tableTopId;
    }

    return controlledBy;
}


function setControlledByAll(tabletop, players) {
    let controlledBy;
    _.each(state.cleanPlayerControlState.characters, function (character) {
        controlledBy = getTurnControllers(character, tabletop, players);
        getObj("character", character.characterId).set("controlledby", controlledBy);
    });
}

function getPlayerCharacterIds(){
    let characterIds = [];
    _.each(state.cleanPlayerControlState.characters, function(character){
        characterIds.push(character.characterId)
    });
    return characterIds;
}


function getCharacterFromState(characterId){
    let outputCharacter;
    _.each(state.cleanPlayerControlState.characters, function(character){
        if(characterId === character.characterId){
            outputCharacter = character;
        }
    });
    return outputCharacter
}


on("chat:message", function (msg) {
    if (msg.type === "api" && msg.content.indexOf("!resetRegistry") === 0) {
        initRegistry(true);
    } else if (msg.type === "api" && msg.content.indexOf("!registerPlayers") === 0) {
        errors = 0
        let playerNames = parseRegisterMsg(msg, "registerPlayers")
        initRegistry(false);
        if (errors === 0) {
            state.registry.playerCharacterNames = playerNames;
        }
    } else if (msg.type === "api" && msg.content.indexOf("!registerTableTops") === 0) {
        errors = 0
        let tableTops = parseRegisterMsg(msg, "registerTableTops")
        initRegistry(false);
        if (errors === 0) {
            state.registry.tableTopsNames = tableTops;
        }
    } else if (msg.type === "api" && msg.content.indexOf("!resetLighting") === 0) {
        initCleanPlayerControlState(true);
    } else if (msg.type === "api" && msg.content.indexOf("!setupLighting") === 0) {
        initCleanPlayerControlState(true);
        if(state.registry.playerCharacterNames.length === 0){
            sendChat("Lighting Setup", "Player character names not found. Run registerPlayers to set player names.");
            errors++;
        }
        if(state.registry.tableTopsNames.length === 0){
            sendChat("Lighting Setup", "Table top names not found. Run registerTableTops to set table top names.");
            errors++;
        }
        if (errors === 0) {
            buildCleanPlayerControlState(state.registry.playerCharacterNames, state.registry.tableTopsNames)
        }
    } else if (msg.type === "api" && msg.content.indexOf("!readState") === 0) {
        if(state.registry) {
            log(state.registry);
        } else {
            log("No registry")
        }
        if(state.cleanPlayerControlState) {
            log(state.cleanPlayerControlState);
        } else {
            log("No cleanPlayerControlState")
        }
    }
});


// todo: test and debug this function after fixing void playercontrolstate
on("change:campaign:turnorder", function (current, previous) {
    const CurrentTO = JSON.parse(current.get("turnorder"));
    // const PreviousTO = JSON.parse(previous["turnorder"]);
    let Token;
    let Character;
    let stateCharacter;

    if (!state.cleanPlayerControlState) {
        sendChat("Lighting Manager", "Lighting setup not performed. Hybrid F2F Virtual Dynamic Lighting not configured. Please register your players and tabletops (!registerPlayers & !registerTableTops). Then run !setupLighting");
        errors++;
    }

    let controlledBy;
    // Process the turn order...
    if (CurrentTO.length > 0) {
        // Give control to only online players, remove tabletop control for all characters
        setControlledByAll(false, true);
        // Get Token ID of current entity's turn
        if (CurrentTO[0].id !== -1) Token = getObj("graphic", CurrentTO[0].id);
        // Get Character represents of current Token
        if (CurrentTO[0].id !== -1 && Token.get("represents") !== "") Character = getObj("character", Token.get("represents"));
        // Check if current token is a player character
        if (CurrentTO[0].id !== -1 && Token.get("represents") !== "" && Character.id in getPlayerCharacterIds()) {
            stateCharacter = getCharacterFromState(Character.id)
            controlledBy = getTurnControllers(stateCharacter, true, true);
            Character.set("controlledby", controlledBy);
        } else {
            // If current token is not a player character, return control to all players during npc and custom item turns...
            setControlledByAll(true, true);
        }
    } else {
        // Turn order tracker is empty. Return control to all players...
        setControlledByAll(true, true);
    }

    // Simple Initiative Tracker (Green Dot)...
    /*if (CurrentTO.length === 0 && PreviousTO[0].id !== -1) getObj("graphic", PreviousTO[0].id).set("status_green", false);
    if (CurrentTO.length > 0 && CurrentTO[0].id !== -1) getObj("graphic", CurrentTO[0].id).set("status_green", true);
    if (PreviousTO.length > 0 && PreviousTO[0].id !== -1) getObj("graphic", PreviousTO[0].id).set("status_green", false);*/
});