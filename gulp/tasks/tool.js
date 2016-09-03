var gulp = require('gulp');
var fs   = require('fs');

//return list of bundle
function getBundleList()
{
    var bundleList = fs.readdirSync('../src/');
    return removeAppBundle(bundleList);
}

//return list of bundle
function getRessourceBundleList()
{
    var bundleList = fs.readdirSync('../web/bundles/');
    return removeRessourceBundle(bundleList);
}

//remove app bundle
function removeRessourceBundle(bundleList)
{
    for (var i = 0; i < bundleList.length; i++) {
        if(bundleList[i] == "framework" || bundleList[i] == "images") {
            bundleList.splice(i, 1);i--;
        }
    }
    return bundleList;
}

//remove app bundle
function removeAppBundle(bundleList)
{
    for (var i=0;i<bundleList.length;i++) {
        if(bundleList[i] == "AppBundle") {
            bundleList.splice(i, 1);
            i--;
        }
    }
    return bundleList;
}

//remove ressource page
function removeRessourcePage(pages) {
    for (var y = 0; y < pages.length; y++) {
        if(pages[y] == "images") {
            pages.splice(y, 1);y--;
        }
    }
    return pages;
}

//remove twing page
function removeTwig(bundlePage) {
    for (var y=0;y<bundlePage.length;y++) {
        if(bundlePage[y].lastIndexOf(".twig")!=-1) {
            bundlePage.splice(y, 1);y--;
        }
    }
    return bundlePage;
}

//return list of pages
function getPageList(bundle) {
    var pages = [];
    for (var i = 0; i < bundle.length; i++) {
        var page = [];
        var bundlePage = fs.readdirSync('../src/' + bundle[i] + '/Resources/views/');
        bundlePage = removeTwig(bundlePage);
        for (var y = 0; y < bundlePage.length; y++) {
            //bundlePage[y] = [bundle[i],bundlePage[y]];
            page[y] = fs.readdirSync('../src/' + bundle[i] + '/Resources/views/' + bundlePage[y])
        }
        for (var y = 0; y < page.length; y++) {
            for (var x = 0; x < page[y].length; x++) {
                page[y][x] = page[y][x].substring(0,page[y][x].length-10);
                pages[pages.length] = [bundle[i],page[y][x]];
            }
        }
    }
    return pages;
}

//return ressource pages
function getRessourcePageList(pageBundle)
{
    var pages = fs.readdirSync('../web/bundles/'+ pageBundle);
    return removeRessourcePage(pages);
}
