from flask import Flask
from flask_cors import CORS, cross_origin
from flask import jsonify
from flask import render_template
from datetime import datetime
from datetime import timedelta
import sys
import platform
import time
import random
import math
import json
import re
from flask_apscheduler import APScheduler

app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

now = datetime.now()

totaltime = 1200
cur_date = ""
cur_time = 0
brightness = 0
suncycles_length = 0
job_status = "inactive"

# get json data
with open('suninfo.json') as f:
    suncycles = json.loads(f.read())
    suncycles_length = len(suncycles)
    print("json length: " + str(suncycles_length))


@app.route('/')
def hello():
    global cur_date, brightness, job_status
    brightness = int(translate(brightness, 0.0, 1.0, 0, 255))
    hexbrightness = "{0:x}{0:x}{0:x}".format(
        brightness, brightness, brightness)
    while True:
        return render_template('index.html', title='Status', date=cur_date, brightness=hexbrightness, status=job_status)


@app.route('/data')
@cross_origin()
def suncycles_data():
    with open('suninfo.json') as f:
        s = f.read()
    return jsonify(s)


@app.route('/output')
@cross_origin()
def output_data():
    global cur_date, brightness, cur_time, job_status
    output_data = {'timeelapsed': cur_time,
                   'brightness': brightness, 'status': job_status}
    return jsonify(output_data)




@app.route('/run-tasks/<year>/<month>/<day>/<hour>/<minute>')
def run_tasks(year=None, month=None, day=None, hour=None, minute=None):
    app.apscheduler.add_job(func=scheduled_task, trigger='date', run_date=datetime(
        int(year), int(month), int(day), int(hour), int(minute), 0), args=['text'], id="sun", replace_existing=True)

    return 'Scheduled several long running tasks.', 200


def scheduled_task(task_id):
    global cur_time, cur_date, brightness, suncycles, suncycles_length, job_status
    print("starting..")
    job_status = "active!"

    start = time.time()
    time.process_time()
    elapsed = 0
    while elapsed < totaltime:
        elapsed = time.time() - start
        decimal = elapsed / totaltime
        total_percent = decimal * 100
        current_day_index = math.floor(decimal * suncycles_length)
        current_day_keys = list(suncycles.keys())[current_day_index]
        current_day_datetime = datetime.strptime(
            str(current_day_keys), '%Y-%m-%d')
        current_day_values = list(suncycles.values())[current_day_index]
        current_day_sunrise = current_day_values["sunrise"]
        current_day_sunset = current_day_values["sunset"]
        sunrise_time = re.match(
            "(^\d):(\d{2}):(\d{2})\sAM", current_day_sunrise)
        sunset_time = re.match(
            "(^\d):(\d{2}):(\d{2})\sPM", current_day_sunset)
        sunrise_hours = sunrise_time.group(1)
        sunrise_minutes = sunrise_time.group(2)
        sunrise_seconds = sunrise_time.group(3)

        sunset_hours = sunset_time.group(1)
        sunset_minutes = sunset_time.group(2)
        sunset_seconds = sunset_time.group(3)

        sunrise_hours_percentage = int(sunrise_hours) / 24
        sunset_hours_percentage = int(sunset_hours) / 24
        sunrise_minutes_percentage = (int(sunrise_minutes) / 60) / 24
        sunset_minutes_percentage = (int(sunset_minutes) / 60) / 24
        sunrise_seconds_percentage = ((int(sunrise_seconds) / 60) / 60) / 24
        sunset_seconds_percentage = ((int(sunset_seconds) / 60) / 60) / 24
        sunrise_percent = sunrise_hours_percentage + \
            sunrise_minutes_percentage + sunrise_seconds_percentage
        sunset_percent = sunset_hours_percentage + \
            sunset_minutes_percentage + sunset_seconds_percentage + .50

        # convert percentage to current time
        year_total_seconds = 366 * 24 * 60 * 60
        percent_to_current_seconds = decimal * year_total_seconds
        current_minute = percent_to_current_seconds / 60
        current_hour = current_minute / 60

        cur_date = current_day_datetime.strftime('%b %d,%Y') + " - " + str(math.floor(current_hour %
                                                                                      24)) + ":" + str(math.floor(current_minute % 60)) + ":" + str(math.floor(percent_to_current_seconds % 60))
        current_hour_percentage = (current_hour % 24) / 24
        current_minutes_percentage = ((current_minute % 60) / 60) / 24
        current_date_percent = current_hour_percentage + \
            current_minutes_percentage

        totaldaylight = sunset_percent - sunrise_percent
        midday = (totaldaylight / 2) + sunrise_percent
        if (current_date_percent < sunrise_percent):
            brightness = 0
        elif (current_date_percent > sunrise_percent and current_date_percent < midday):
            brightness = translate(current_date_percent,
                                   sunrise_percent, midday, 0.0, 1.0)
        elif (current_date_percent > midday and current_date_percent < sunset_percent):
            brightness = translate(current_date_percent,
                                   midday, sunset_percent, 1.0, 0.0)
        else:
            brightness = 0

        # FOR DEBUGGIN:
        if (elapsed > 1100):
            elapsed = 0
        time.sleep(0.2)

    job_status = "inactive"
    # scheduler.remove_job('sun')


def translate(value, leftMin, leftMax, rightMin, rightMax):
    # Figure out how 'wide' each range is
    leftSpan = leftMax - leftMin
    rightSpan = rightMax - rightMin

    # Convert the left range into a 0-1 range (float)
    valueScaled = float(value - leftMin) / float(leftSpan)

    # Convert the 0-1 range into a value in the right range.
    return rightMin + (valueScaled * rightSpan)


if __name__ == '__main__':
    app.run()
