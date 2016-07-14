var fs = require('fs');
var concat = require('concat-files');
var resources = fs.readdirSync('./web/resources')

var allResources = [];

for (var i=0;i<resources.length;i++) {
    var files = fs.readdirSync('./web/resources/'+ resources[i])
    for (var y=0;y<files.length;y++) 
    {
        if(files[y].lastIndexOf(".js")==-1) {
            files.splice(y, 1);y--;
        } else {
            files[y] = './web/resources/'+ resources[i]+ '/' + files[y]
        }
    }
    allResources = allResources.concat(files)
}
console.log(allResources)

for (var i=0;i<resources.length;i++) {
    
    if(resources[i].search("#")==-1 && resources[i] != "img") {
        var dirJS = [];
        for (var y=0;y<resources.length;y++) {
            if(resources[y].search(resources[i]+ "#")>-1) {
                dirJS = dirJS.concat(resources[y])
            }
        }

        try {
            fs.accessSync("./web/resources/" + resources[i] + "/" + resources[i] + ".js", fs.F_OK);
        } catch (e) {
            fs.writeFile("./web/resources/" + resources[i] + "/" + resources[i] + ".js","", function(err) {
                if(err) { return console.log(err);
                }
            });
        }
        var tab = [];
        tab[0] = "./web/resources/" + resources[i] + "/" + resources[i] + ".js"
        for (var y=0;y<dirJS.length;y++) {
            tab[y+1] = "./web/resources/" + dirJS[y] + "/" + dirJS[y] + ".js"
        }
        console.log(tab)
        concat(tab
           
        , "./web/resources/" + resources[i] + "/" + resources[i] + ".js", function() {
        });

    }
}


/*for (var i=0;i<allResources.length;i++) {
    concat([
        './app/Resources/js/jquery/jquery.min.js',
        allResources[i]
    ], allResources[i], function() {
        console.log('done');
    });
}*/