// define global variables

var dmDynamo = (function(){

    let globals = {
        styles: {
            ...
        },
        variables: {
            ...
        },
        about: {
            name: "...",
            namespace: "...",
            version: "...",
        },
        commands: {
            rootCommand: "...",
            actions: "....",
            objects: "...",
            modifiers: "...",
        }
    }

    class Main {
        constructor() {...},

        inputHandler() {...}
    }

    class Menu {
        constructor(scriptName) {
            this.title = "";
            this.contents = "";
            this.scriptName = scriptName;
            this.menuHtml = "";
        }

        makeMenu() {
            this.message += this.title + this.contents

            this.contents = this.message;
        }
        displayMenu(whisperTo = null, callback=null, noarchive=false, use3d=false) {
            let whisper = "";
            if (whisperTo !== null && whisper !== void 0 && whisperTo !== "") {
                whisper = "/w " + whisperTo + " "
            }

            let options = {noarchive: noarchive, use3d: use3d}

            sendChat(this.scriptName, whisper + this.menuHtml, callback, options);
        }

        makeDiv(content, styles) {
            return '<div style="'+styles+'">' + content + '</div>'
        }

        makeSpan(content, styles) {
            return '<span style=' + styles + '>' + content + '</span>'
        }
    }

    class MainMenu extends Menu{
        constructor(styles, contents) {
            super();
            this.styles = styles
            this.contents = contents
        }
        makeTitle() {
            let mainTitleSpan = this.makeSpan(myContent, styles)
            return this.makeDiv(mainTitleSpan, styles)
        }
    }

}