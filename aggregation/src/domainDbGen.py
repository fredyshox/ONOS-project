import csv
import sys
import json

if len(sys.argv) < 3:
    print("Usage: {} infile outfile".format(sys.argv[0]))
    exit(1)

tracker_dict = dict()
site_set = set()

with open(sys.argv[1], 'r') as infile:
    inreader = csv.reader(infile, delimiter=';')
    for row in inreader:
        if row[1] not in tracker_dict:
            d = dict()
            d['owner'] = row[2]
            d['count'] = 1
            tracker_dict[row[1]] = d
        else:
            tracker_dict[row[1]]['count'] += 1
        site_set.add(row[0])

count = len(site_set)
print(f"Website count {count}")
print(f"Tracker count {len(tracker_dict)}")

for key in tracker_dict.keys():
    tracker_dict[key]['site_reach'] = tracker_dict[key]['count'] / count

with open(sys.argv[2], "w") as f:
    json.dump(tracker_dict, f, indent=4)
