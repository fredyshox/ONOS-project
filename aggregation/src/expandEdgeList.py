import csv
import sys
import re
import json

if len(sys.argv) < 3:
    print("Usage: {} edgelist crawljson".format(sys.argv[0]))
    exit(1)

edges_file = open(sys.argv[1], 'r')
crawl_file = open(sys.argv[2], 'r')
reader = csv.reader(edges_file, delimiter=';')
site_dict = json.load(crawl_file)

edge_dict = dict()
www_pattern = re.compile("^www[A-Za-z0-9]*\..")
def rm_match(string, pattern):
    ms = pattern.match(string)
    if ms:
        print(f"Before {string} - after: {string[ms.end() - 1:]}", file=sys.stderr)
        return string[ms.end() - 1:]
    else:
        return string

for source, dest in reader:
    
    source = rm_match(source, www_pattern)
    dest = rm_match(dest, www_pattern)
    
    if source not in edge_dict:
        edge_dict[source] = set()

    if source != dest:
        edge_dict[source].add(dest)

for vid, site in site_dict.items():
    url = site['url']
    url = rm_match(url, www_pattern)
    if url not in edge_dict:
        edge_dict[url] = set()

    reqs = set([rm_match(hr, www_pattern) for hr in site['request_urls']])
    reqs.discard(url)
    edge_dict[url].update(reqs)

for source, dest in edge_dict.items():
    for u in dest:
        print(f"{source};{u}")

edges_file.close()
crawl_file.close()
