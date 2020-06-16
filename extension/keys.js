// constants
const TRACKER_PREFIX = "TRACKERS"
const WEBSITE_PREFIX = "WEBSITES"
const COUNT_KEY = "COUNT"

// create key for tracker with domain
function trackerKey(domain) {
    return TRACKER_PREFIX + "_" + domain;
}

// create key for website with domain
function websiteKey(domain) {
    return WEBSITE_PREFIX + "_" + domain;
}

// create chrome.storage query for website
function websiteQuery(domain) {
    const key = websiteKey(domain);
    var query = {};
    query[key] = [];
    return query;
}

// create chrome.storage query for tracker
function trackerQuery(domain) {
    const key = trackerKey(domain);
    var query = {};
    query[key] = {};
    return query;
}

window.keys = {
    trackerKey: trackerKey,
    trackerQuery: trackerQuery,
    websiteKey: websiteKey,
    websiteQuery: websiteQuery
}