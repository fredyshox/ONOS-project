from adblockparser import AdblockRules
import csv
import sys

if len(sys.argv) < 4:
    print("Usage: {} rulesfile infile outfile".format(sys.argv[0]))
    exit(1)

fp = open(sys.argv[1], 'r')
raw_rules =  [line.strip() for line in fp]
fp.close()

rules = AdblockRules(raw_rules) 
with open(sys.argv[2], 'r') as infile, open(sys.argv[3], 'w') as outfile:
    inreader = csv.reader(infile, delimiter=';')
    outwriter = csv.writer(outfile, delimiter=';')
    for row in inreader:
        domain = 'https://' + row[1]
        if rules.should_block(domain):
            outwriter.writerow(row)

