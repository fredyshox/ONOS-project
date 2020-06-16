import sqlite3 as sql
import sys
from urllib.parse import urlparse
import json

if len(sys.argv) < 3:
    print("Usage: {} dbfile outputjson")
    exit(1)

db_file = sys.argv[1]
conn = sql.connect(db_file)
cur = conn.cursor()

visits = cur.execute("SELECT v.visit_id, v.site_url FROM site_visits AS v;").fetchall()
hr_output = cur.execute("SELECT DISTINCT hr.url, hr.visit_id, v.site_url FROM http_requests AS hr INNER JOIN site_visits as v ON hr.visit_id=v.visit_id;").fetchall()
js_output = cur.execute("SELECT js.script_url, js.visit_id FROM javascript AS JS;").fetchall()
jsc_output = cur.execute("SELECT jsc.host, jsc.visit_id FROM javascript_cookies AS jsc;").fetchall()

site_dict = dict()
for identifier, url in visits:
    d = dict()
    parsed = urlparse(url)
    host = parsed.netloc
    d['url'] = host
    d['request_urls'] = set()
    d['cookies_host'] = set()
    site_dict[identifier] = d

for url, visit_id, site_url in hr_output:
    if visit_id in site_dict:
        parsed = urlparse(url)
        host = parsed.netloc
        site_dict[visit_id]['request_urls'].add(host)

for script_url, visit_id in js_output:
    if visit_id in site_dict:
        parsed = urlparse(script_url)
        host = parsed.netloc
        site_dict[visit_id]['request_urls'].add(host)
    
for host, visit_id in jsc_output:
    if visit_id in site_dict:
        if not host[0].isalnum():
            host = host[1:]
        if host[0:3] == 'www':
            host = host[3:]
        site_dict[visit_id]['cookies_host'].add(host)

for key, value in site_dict.items():
    value['request_urls'] = list(value['request_urls'])
    value['cookies_host'] = list(value['cookies_host'])

with open(sys.argv[2], "w") as f:
    json.dump(site_dict, f, indent=4)

