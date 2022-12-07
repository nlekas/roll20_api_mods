on("chat:message", function (msg) {
    if (msg.type === "api" && msg.content.indexOf("!deleteState") === 0) {
        let args = msg.content.split("|");
        args.shift()

        _.each(args, function(arg){
           delete state[arg];
        });
    }
});