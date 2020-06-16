var currentDomainData = [];
var selectedStatIndex = 0;

function onAppear() {
    chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
        const activeTab = tabs[0]
        const urlString = activeTab.pendingUrl || activeTab.url;
        // parse domain 
        const hostname = (new URL(urlString)).hostname;
        const domain = psl.get(hostname);
        console.log(`Current hostname ${hostname}, domain name: ${domain}`)
        ui_setCurrentDomain(domain);
        fetchWebsiteData(domain, function (arr) {
            var uniqueTrackers = new Set();
            ui_setTrackerCount(arr.length);
            arr.forEach(function (item) {
                const domain = psl.get(item);
                if (!uniqueTrackers.has(domain)) {
                    uniqueTrackers.add(domain);
                    fetchTrackerData(domain, function (data) {
                        data.domain = domain;
                        currentDomainData.push(data);
                        console.log(`Tracker data: ${JSON.stringify(data)}`);
                        currentDomainData = sortDomainData(currentDomainData, selectedStatIndex);
                        ui_displayStats(currentDomainData, selectedStatIndex);
                    });
                }
            });
        })
    });
}

function fetchWebsiteData(domain, callback) {
    const key = websiteKey(domain);
    const query = websiteQuery(domain);
    chrome.storage.local.get(query, function (result) {
        const trackers = result[key];
        callback(trackers);
    });
}

function fetchTrackerData(domain, callback) {
    const key = trackerKey(domain);
    const query = trackerQuery(domain);
    chrome.storage.local.get(query, function (result) {
        const data = result[key];
        callback(data);
    });
}

function sortDomainData(data, statIndex) {
    if (statIndex == 0) {
        data.sort(function (a, b) {
            const aOnwer = a["owner"];
            const bOwner = b["owner"];
            console.log(aOnwer, bOwner);
            if (aOnwer === "Unknown") {
                return 1;
            } else if (bOwner === "Unknown") {
                return -1;
            }

            return aOnwer > bOwner ? 1 : -1;
        })
    } else if (statIndex == 1) {
        data.sort(function (a, b) {
            const aGR = a["global_site_reach"];
            const bGR = b["global_site_reach"];
            if (aGR === "N/A") {
                return 1;
            } else if (bGR == "N/A") {
                return -1;
            }

            return aGR > bGR ? -1 : 1;
        });
    } else {
        data.sort(function (a, b) {
            return a["visit_count"] > b["visit_count"] ? -1 : 1;
        })
    }
    return data;
}

function ui_setCurrentDomain(domain) {
    var element = document.getElementById("header-label");
    element.innerHTML = domain;
}

function ui_setTrackerCount(count) {
    var element = document.getElementById("header-count");
    element.innerHTML = count;
}

function ui_displayStats(data, statIndex) {
    if (statIndex == 0) {
        // Owner
        ui_setTrackerList(data, "owner");
    } else if (statIndex == 1) {
        // Reach
        ui_setTrackerList(data, "global_site_reach", ui_reachLabel);
    } else {
        // Count 
        ui_setTrackerList(data, "visit_count");
    }
}

function ui_setTrackerList(data, itemKey, processingCb) {
    var htmlList = data.map(function (item) {
        var value = item[itemKey];
        if (processingCb) {
            value = processingCb(value);
        }
        return `<li class="list-group-item d-flex justify-content-between py-1">
        <small>${item["domain"]}</small>
        <span class="badge badge-dark badge-pill">${value}</span>
        </li>`
    })
    var element = document.getElementById("stat-list");
    element.innerHTML = htmlList.join("\n");
}

function ui_reachLabel(reach) {
    if (typeof(reach) == "number") {
        return reach.toFixed(3);
    } else {
        return reach;
    }
}

function onSegmentedControl(event) {
    const element = event.target;
    const index = element.id.slice(-1);
    selectedStatIndex = parseInt(index);
    for (var i = 0; i < 3; i++) {
        var descElement = document.getElementById("stat-desc" + i);
        if (i == index) {
            descElement.className = "";
        } else {
            descElement.className = "d-none";
        }
    }

    console.log(`Clicked: ${element.id}`);
    currentDomainData = sortDomainData(currentDomainData, selectedStatIndex);
    ui_displayStats(currentDomainData, selectedStatIndex);
}

window.addEventListener('load', function () {
    console.log("On Window load");
    onAppear()
    for (var i = 0; i < 3; i++) {
        var tab = document.getElementById(`tab${i}`);
        tab.addEventListener("click", onSegmentedControl)
    }
})