import tldextract
import csv
import sys
import json

if len(sys.argv) < 3:
    print('Usage: {} mapfile incsvfile outcsvfile'.format(sys.argv[0]), file=sys.stderr)
    exit(1)


with open(sys.argv[1], 'r') as mapfile, open(sys.argv[2], 'r') as infile, open(sys.argv[3], 'w') as outfile:
    company_map = json.load(mapfile)
    inreader = csv.reader(infile, delimiter=';')
    outwriter = csv.writer(outfile, delimiter=';')
    for row in inreader:
        tracker_url = 'https://' + row[1]
        ext = tldextract.extract(tracker_url)
        domain = ext.registered_domain
        if domain in company_map:
            company_name = company_map[domain]['displayName']
            outwriter.writerow(row + [company_name])
        else:
            print('Unknown domain: {}'.format(domain), file=sys.stderr)
            outwriter.writerow(row + ['Unknown'])

