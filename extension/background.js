// Constants
const DB_PATH = "data/myfile.json"

// Global state
var domainDatabase = null;
var adblockEngine = null

// Check if request to url, can be considered as tracker/ad
function isAdOrTracker(url) {
    const result = adblockEngine.match(adblocker.Request.fromRawDetails({
        url: url
    }));

    return result.match;
}

// evaluate source-dest pair, and update state
function evalRequest(sourceDomain, destDomain) {
    var defaultKey = {}
    defaultKey[sourceDomain] = []
    chrome.storage.local.get(defaultKey, function (result) {
        var resultSet = new Set(result[sourceDomain])
        if (!resultSet.has(destDomain)) {
            // update domains
            resultSet.add(destDomain)
            // change key
            var key = {}
            key[sourceDomain] = Array.from(resultSet)
            // update storage
            chrome.storage.local.set(key, function () {
                console.log("Request saved");
            })
        }
        console.log(`Set size: ${resultSet.size}`)
    })
}

// Clear previous data
chrome.storage.local.clear(function () {
    console.log("Successfully cleared all storage");
})

// Initialize adblock engine
adblocker.FiltersEngine.fromPrebuiltAdsAndTracking()
    .then(function (engine) {
        console.log("Adblock engine loaded");
        adblockEngine = engine;
    })
    .catch(function (err) {
        console.log(`Adblock engine load failed ${err}`);
    })

// Read domain database
chrome.runtime.onStartup.addListener(function () {
    // load domain database from json
    chrome.runtime.getPackageDirectoryEntry(function (dirEntry) {
        dirEntry.getFile(DB_PATH, undefined, function (fileEntry) {
        fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.addEventListener("load", function (event) {
                    // data now in reader.result    
                    domainDatabase = JSON.parse(reader.result);
                });
                reader.readAsText(file);
            });
        }, function (err) {
            console.log(err);
        });
    });
})

// Set web request listener
chrome.webRequest.onCompleted.addListener(function (details) {
    // if engine is not loaded, do nothing
    if (!adblockEngine) {
        return;
    }


    const sourceUrl = details.initiator;
    const destUrl = details.url;
    console.log(`Request: ${sourceUrl} => ${destUrl}`);
    if (sourceUrl && isAdOrTracker(destUrl)) {
        const sourceDomain = (new URL(sourceUrl)).hostname;
        const destDomain = (new URL(destUrl)).hostname;
        if (sourceDomain != destDomain) {
            evalRequest(sourceDomain, destDomain);
        }
    }
}, {urls: ["http://*/*", "https://*/*"]})