// Constants
const DB_PATH = "data/myfile.json"

// Global state
var statDatabase = [];

function addRequest(sourceDomain, destDomain) {
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

chrome.runtime.onStartup.addListener(function () {
    // load stat database from json
})

chrome.storage.local.clear(function () {
    console.log("Successfully cleared all storage");
})

chrome.webRequest.onCompleted.addListener(function (details) {
    const sourceUrl = details.initiator;
    const destUrl = details.url;
    // get domain name
    console.log(`Request: ${sourceUrl} => ${destUrl}`);
    if (sourceUrl) {
        const sourceDomain = (new URL(sourceUrl)).hostname;
        const destDomain = (new URL(destUrl)).hostname;
        if (sourceDomain != destDomain) {
            addRequest(sourceDomain, destDomain);
        }
    }
}, {urls: ["http://*/*", "https://*/*"]})