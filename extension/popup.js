var currentDomainData = []

function onAppear() {
    chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
        const activeTab = tabs[0]
        const urlString = activeTab.pendingUrl || activeTab.url;
        // parse domain 
        const url = new URL(urlString);
        console.log(`Current domain ${url.hostname}`)
        ui_setCurrentHostname(url.hostname);
        fetchData(url.hostname, function (data) {
            currentDomainData = data;
            ui_setTrackerCount(data.length);
            ui_setTrackerList(data);
        })
    });
}

function fetchData(domain, callback) {
    var defaultKey = {}
    defaultKey[domain] = []
    chrome.storage.local.get(defaultKey, function (result) {
        const data = result[domain];
        callback(data);
    });
}

function ui_setCurrentHostname(hostname) {
    var element = document.getElementById("header-label");
    element.innerHTML = hostname;
}

function ui_setTrackerCount(count) {
    var element = document.getElementById("header-count");
    element.innerHTML = count;
}

function ui_setTrackerList(data) {
    var htmlList = data.map(function (item) {
        return `<li class="list-group-item py-1"><small>${item}</small></li>`
    })
    var element = document.getElementById("stat-list");
    element.innerHTML = htmlList.join("\n");
}

function onSegmentedControl(e) {

}


window.addEventListener('load', function () {
    console.log("On load")
    onAppear()
})