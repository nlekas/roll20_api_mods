// define global variables

var dmDynamo = (function () {

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
            constructor() {...
            }

        ,

            inputHandler() {...
            }
        }


        class Style {
            constructor(color = void 0,
                        padding = void 0,
                        fontSize = void 0,
                        fontFamily = void 0,
                        margin = void 0,
                        border = void 0,
                        bgColor = void 0,
                        marginRight = void 0,
                        verticalAlign = void 0,
                        display = void 0
            ) {
                this.color = color;
                this.padding = padding;
                this.fontSize = fontSize;
                this.fontFamily = fontFamily;
                this.margin = margin;
                this.border = border;
                this.bgColor = bgColor;
                this.marginRight = marginRight;
                this.verticalAlign = verticalAlign;
                this.display = display
            }
            asObj(){
                return {
                    "color": this.color,
                    "padding": this.padding,
                    "font-size": this.fontSize,
                    "font-family": this.fontFamily,
                    "margin": this.margin,
                    "border": this.border,
                    "background-color": this.bgColor,
                    "margin-right": this.marginRight,
                    "vertical-align": this.verticalAlign,
                    "display": this.display
                };
            }

        }

        
        class ChatContent {
            constructor(scriptName) {
                this.title = "";
                this.contents = "";
                this.scriptName = scriptName;
                this.menuHtml = "";
            }

            makeMenu() {
                this.menuHtml = this.title + this.contents
            }

            displayMenu(whisperTo = null, callback = null, noarchive = false, use3d = false) {
                let whisper = "";
                if (whisperTo !== null && whisper !== void 0 && whisperTo !== "") {
                    whisper = "/w " + whisperTo + " ";
                }

                let options = {noarchive: noarchive, use3d: use3d};

                sendChat(this.scriptName, whisper + this.menuHtml, callback, options);
            }

            makeDiv(content, styles) {
                return '<div style="' + styles + '">' + content + '</div>';
            }

            makeSpan(content, styles) {
                return '<span style=' + styles + '>' + content + '</span>';
            }

            makeHref(content, styles, href, title) {
                let titleHtml = ""

                if(title !== void 0) {
                    titleHtml = '" title="' + title;
                }

                return '<a style="' + styles + titleHtml + '" href="' + href + '">' + content + '</a>';
            }

            makeList(items, lStyles, liStyles, ulOrOl) {
                let list = '<' + ulOrOl + ' style="' + lStyles + '">';

                _.forEach(items, function (item) {
                    list += '<li style="' + liStyles + '">' + item + '</li>';
                });

                list += '</' + ulOrOl + '>';
            }

            makeImageButton(command, image, toolTip, backgroundColor, size, stylesDiv, stylesSpan, stylesHref) {
                let button = this.makeSpan(image, stylesSpan);
                button = this.makeHref(button, stylesHref, command, toolTip);
                button = this.makeDiv(button, stylesDiv)
                return button
            }

            makeTextButton(command, label, toolTip, value, stylesSpan, stylesHref, title = void 0) {
                let button = this.makeSpan(label, stylesSpan)
                button += this.makeHref(value, stylesHref, command, title)
                return button
            }
        }

        class MainMenu extends ChatContent {
            constructor(styles, contents) {
                super();
                this.styles = styles
                this.contents = contents
            }

            makeTitle() {
                let mainTitleSpan = this.makeSpan(myContent, styles)
                return this.makeDiv(mainTitleSpan, styles)
            }



            makeMainMenu() {
                this.menuHtml = this.makeTitle() + this.makeContent() + this.makeFooter()
            }
        }

        let mm = new MainMenu(mystyles, mycontent);
        mm.displayMenu()
    }

)