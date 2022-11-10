var HybridF2fVirtualDynamicLighting = (function(){
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

    function tableTopsObjectToIdArray(tableTops){
        ids = [];
        _.each(tableTops, function(tableTop){
            ids.push(tableTop.playerId)
        });
        return ids
    }


    function buildCleanPlayerControlState(playerNames, tableTopNames) {
        let name;
        let characterId;
        let playerControllers = [];
        let tableTopIds = [];
        let controllers;
        let tableTops = tableTopsObjectToIdArray(parseTableTops(tableTopNames));
        let row;

        const characters = findObjs({_type: 'character'});
        _.each(characters, function(character){
            name = character.get("name")
            if(playerNames.indexOf(name) !== -1){
                characterId = character.get("id")
                controllers = character.get('controlledby').split(",");
                _.each(controllers, function(controller){
                    if(tableTops.indexOf(controller) !== -1){
                        tableTopIds.push(controller);
                    } else {
                        playerControllers.push(controller);
                    }
                });
                row = {
                    name: name,
                    characterId: characterId,
                    playerControllersIds: playerControllers,
                    tableTopId: tableTopIds
                };
                state.cleanPlayerControlState.characters.push(row);
                playerControllers = [];
                tableTopIds = [];
            }
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
            _.each(character.playerControllersIds, function (controllerPlayer) {
                controlledBy = controlledBy + "," + controllerPlayer;
            });
        }
        if (tabletops) {
            _.each(character.tableTopId, function (controllingTableTop){
                controlledBy = controlledBy + "," + controllingTableTop;
            });

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
            // For Debugging
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


    on("change:campaign:turnorder", function (current) {
        const CurrentTO = JSON.parse(current.get("turnorder"));
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
            if (CurrentTO[0].id !== -1 && Token.get("represents") !== "" && getPlayerCharacterIds().indexOf(Character.id) !== -1) {
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
    });

    return {
        parseTableTops: parseTableTops,
        tableTopsObjectToIdArray: tableTopsObjectToIdArray,
        buildCleanPlayerControlState: buildCleanPlayerControlState,
        parseRegisterMsg: parseRegisterMsg,
        initRegistry: initRegistry,
        initCleanPlayerControlState: initCleanPlayerControlState,
        getTurnControllers: getTurnControllers,
        setControlledByAll: setControlledByAll,
        getPlayerCharacterIds: getPlayerCharacterIds,
        getCharacterFromState: getCharacterFromState
    }
})();
