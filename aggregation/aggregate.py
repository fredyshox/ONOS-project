# Main data aggregation script using OpenWPM
#

import sys
# add openwpm dir to pythonpath
sys.path.insert(0, '/opt/OpenWPM')
from automation import CommandSequence, TaskManager

if len(sys.argv) < 4:
    print(f"Usage: {sys.argv[0]} num_browsers path_to_urls output_filename")
    exit(1)

# sites and numbrowsers
NUM_BROWSERS = int(sys.argv[1])
NUM_LINKS = 5
urls_file = open(sys.argv[2], 'r')
urls = [line.strip() for line in urls_file]
urls_file.close()
output_filename = sys.argv[3]

# Loads the default manager params
# and NUM_BROWSERS copies of the default browser params
manager_params, browser_params = TaskManager.load_default_params(NUM_BROWSERS)

# ustawiamy co nas interesuje
for i in range(NUM_BROWSERS):
    # Record HTTP Requests and Responses
    browser_params[i]['http_instrument'] = True
    # Record cookie changes
    browser_params[i]['cookie_instrument'] = True
    # Record JS Web API calls
    browser_params[i]['js_instrument'] = True
    # Record the callstack of all WebRequests made
    browser_params[i]['callstack_instrument'] = True

# Launch only browser 0 headless (no gui)
browser_params[0]['display_mode'] = 'headless'

# Update TaskManager configuration (use this for crawl-wide settings)
# ~/Desktop is also plugged as docker volume (visible on host)
manager_params['data_directory'] = '~/Desktop/'
manager_params['log_directory'] = '~/Desktop/'
manager_params['database_name'] = output_filename

# Instantiates the measurement platform
# Commands time out by default after 60 seconds
manager = TaskManager.TaskManager(manager_params, browser_params)

for url in urls:
    # Parallelize sites over all number of browsers set above.
    # (To have all browsers go to the same sites, add `index='**'`)
    cs = CommandSequence.CommandSequence(
        url, 
        reset=True,
        callback=lambda val=url: print("CommandSequence {} done".format(val)))
    
    # do stuff
    cs.browse(NUM_LINKS, sleep=3, timeout=60)

    # run
    manager.execute_command_sequence(cs)

# shut down
manager.close()
