// Constants
const DB_PATH = "data/trackers.json"

// Global state
var domainDatabase = null;
var adblockEngine = null;
var uniqueSites = 0;

// Check if request to url, can be considered as tracker/ad
function isAdOrTracker(url) {
    const result = adblockEngine.match(adblocker.Request.fromRawDetails({
        url: url
    }));

    return result.match;
}

// evaluate source-dest pair, and update state
function evalRequest(sourceHostname, destHostname) {
    const sourceDomain = psl.get(sourceHostname);
    const sourceKey = websiteKey(sourceDomain);
    var query = {}
    query[sourceKey] = []
    chrome.storage.local.get(query, function (result) {
        var resultSet = null;
        var siteCount = uniqueSites;
        if (!result[sourceKey]) {
            siteCount += 1;
            resultSet = new Set();
        } else {
            resultSet = new Set(result[sourceKey])
        }

        if (!resultSet.has(destHostname)) {
            // update domains
            resultSet.add(destHostname)
            // change key
            result[sourceKey] = Array.from(resultSet)
            // update storage
            chrome.storage.local.set(result, function () {
                console.log("Request saved");
            })
            evalDestination(destHostname);
        }

        if (siteCount != uniqueSites) {
            updateSiteCount(siteCount);
        }

        console.log(`Set size for ${sourceDomain}: ${resultSet.size}`)
    })
}

// update number of visited sites(per domain)
function updateSiteCount(count) {
    uniqueSites = count;
    var key = {};
    key[COUNT_KEY] = uniqueSites;
    chrome.storage.local.set(key, function () {
        console.log("Unique site count updated");
    })
}

// evaluate destination
function evalDestination(destHostname) {
    const destDomain = psl.get(destHostname);
    const destKey = trackerKey(destDomain);
    var query = {}
    query[destKey] = {}
    chrome.storage.local.get(query, function (result) {
        var obj = result[destKey];
        console.log(`INITIAL OBJECT: ${JSON.stringify(obj)}`)
        if (Object.keys(obj).length === 0) {
            console.log("Initial object")
            obj["visit_count"] = 1;
            if (domainDatabase[destHostname]) {
                obj["global_site_reach"] = domainDatabase[destHostname]["site_reach"];
                obj["owner"] = domainDatabase[destHostname]["owner"];
            } else {
                obj["global_site_reach"] = "N/A"
                obj["owner"] = "Unknown";
            }
        } else {
            console.log("Other obejct")
            obj["visit_count"] = obj["visit_count"] + 1;
        }
        console.log("saving")
        console.log(obj);
        result[destKey] = obj;
        console.log(result);
        chrome.storage.local.set(result, function () {
            console.log("Tracker saved");
        })
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
chrome.runtime.getPackageDirectoryEntry(function (dirEntry) {
    dirEntry.getFile(DB_PATH, undefined, function (fileEntry) {
    fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.addEventListener("load", function (event) {
                // data now in reader.result    
                domainDatabase = JSON.parse(reader.result);
                console.log("Domain database loaded");
            });
            reader.readAsText(file);
        });
    }, function (err) {
        console.error(err);
    });
});

// Set web request listener
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    // if engine is not loaded, do nothing
    if (!adblockEngine || ! domainDatabase) {
        return;
    }

    try {
        const sourceUrl = details.initiator;
        const destUrl = details.url;
        console.log(`Request: ${sourceUrl} => ${destUrl}`);
        if (sourceUrl && isAdOrTracker(destUrl)) {
            const sourceHostname = (new URL(sourceUrl)).hostname;
            const destHostname = (new URL(destUrl)).hostname;
            console.log(sourceHostname, destHostname);
            if (sourceHostname != destHostname) {
                evalRequest(sourceHostname, destHostname);
            }
        }
    } catch (e) {
        console.log(e)
    }
}, {urls: ["http://*/*", "https://*/*"]})