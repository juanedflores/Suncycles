#!/usr/bin/python3

import json
import urllib.request

from datetime import timedelta, date


def daterange(date1, date2):
    for n in range(int((date2 - date1).days)+1):
        yield date1 + timedelta(n)


start_dt = date(2020, 1, 1)
end_dt = date(2020, 12, 31)

# JSON data:
json_output = '{}'
load_json = json.loads(json_output)

file_times = open("suninfo.json", "a")
for dt in daterange(start_dt, end_dt):
    date = dt.strftime("%Y-%m-%d")

    url = "https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=" + date
    json_data = urllib.request.urlopen(url)
    data = json.loads(json_data.read())
    results = data['results']
    sunrise = str(results['sunrise'])
    sunset = str(results['sunset'])

    sunrise_json = {str(date):
                    {"sunrise": sunrise,
                     "sunset": sunset
                     }}

    load_json.update(sunrise_json)

file_times.write(json.dumps(load_json))

file_times.close()
