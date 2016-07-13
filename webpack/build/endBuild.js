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
for (var i=0;i<allResources.length;i++) {
    concat([
        './app/Resources/js/jquery/jquery.min.js',
        allResources[i]
    ], allResources[i], function() {
        console.log('done');
    });
}