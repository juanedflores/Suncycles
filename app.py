from flask import Flask
from flask import send_file
from flask import jsonify
from flask import render_template
from flask_cors import CORS, cross_origin
from flask_apscheduler import APScheduler
from datetime import datetime
from datetime import timedelta
from urllib.request import Request, urlopen
from dotenv import load_dotenv
import sys
import platform
import time
import random
import math
import json
import re
import os

import cv2
import base64
import numpy as np

from threading import Thread

app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config["CACHE_TYPE"] = "null"
app.config["TEMPLATES_AUTO_RELOAD"] = True

extra_dirs = ['./static/satellite.jpg']
extra_files = extra_dirs[:]

# load .env containing API keys
test = load_dotenv()

totaltime = 1200
cur_date = ""
cur_time = 0
brightness = 0
suncycles_length = 0
elapsed = 0
job_status = "inactive"
current_day_keys = "2020-01-01"

thread = False

# get json data
with open('suninfo.json') as f:
    suncycles = json.loads(f.read())
    suncycles_length = len(suncycles)


# @app.before_first_request
def activate_job():

    def run_job():
        global cur_date, brightness, job_status, current_day_keys, thread
        print("new job..")
        if (thread == False):
            thread = True
            print("running job..")
            while True:
                print("Getting Satelling Images..")

                img_dimensions = 0.6
                satellite_date = current_day_keys
                # satellite_date = "2020-05-01"

                san_antonio_url = "https://api.nasa.gov/planetary/earth/imagery?lon={}&lat={}&date={}&dim={}&api_key={}".format(
                    -98.49363, 29.42412, satellite_date, img_dimensions, os.getenv("NASA_API"))

                mexico_city_url = "https://api.nasa.gov/planetary/earth/imagery?lon={}&lat={}&date={}&dim={}&api_key={}".format(
                    -99.12766, 19.42847, satellite_date, img_dimensions, os.getenv("NASA_API"))
                hdr = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
                }

                req_sa = Request(san_antonio_url, headers=hdr)
                response_sa = urlopen(req_sa)

                picture_sa = np.asarray(
                    bytearray(response_sa.read()), dtype="uint8")
                nparr_sa = np.frombuffer(picture_sa, np.uint8)
                img_sa = cv2.imdecode(nparr_sa, cv2.IMREAD_COLOR)

                height_sa = img_sa.shape[0]
                width_sa = img_sa.shape[1]

                width_cutoff = width_sa // 2

                s1 = img_sa[:, :width_cutoff]

                req_mx = Request(mexico_city_url, headers=hdr)
                response_mx = urlopen(req_mx)

                picture_mx = np.asarray(
                    bytearray(response_mx.read()), dtype="uint8")
                nparr_mx = np.frombuffer(picture_mx, np.uint8)
                img_mx = cv2.imdecode(nparr_mx, cv2.IMREAD_COLOR)

                s2 = img_mx[:, width_cutoff:]

                combined_img = np.hstack((s1, s2))

                cv2.imwrite('./static/satellite.jpg', combined_img)

                time.sleep(10)

    thread = Thread(target=run_job)
    # thread.start()


def run_job():
    global cur_date, brightness, job_status, current_day_keys, thread
    print("new job..")
    if (thread == False):
        thread = True
        print("running job..")
        while True:
            print("Getting Satelling Images..")

            img_dimensions = 0.6
            satellite_date = current_day_keys
            # satellite_date = "2020-05-01"

            san_antonio_url = "https://api.nasa.gov/planetary/earth/imagery?lon={}&lat={}&date={}&dim={}&api_key={}".format(
                -98.49363, 29.42412, satellite_date, img_dimensions, os.getenv("NASA_API"))

            mexico_city_url = "https://api.nasa.gov/planetary/earth/imagery?lon={}&lat={}&date={}&dim={}&api_key={}".format(
                -99.12766, 19.42847, satellite_date, img_dimensions, os.getenv("NASA_API"))
            hdr = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
            }

            req_sa = Request(san_antonio_url, headers=hdr)
            response_sa = urlopen(req_sa)

            picture_sa = np.asarray(
                bytearray(response_sa.read()), dtype="uint8")
            nparr_sa = np.frombuffer(picture_sa, np.uint8)
            img_sa = cv2.imdecode(nparr_sa, cv2.IMREAD_COLOR)

            height_sa = img_sa.shape[0]
            width_sa = img_sa.shape[1]

            width_cutoff = width_sa // 2

            s1 = img_sa[:, :width_cutoff]

            req_mx = Request(mexico_city_url, headers=hdr)
            response_mx = urlopen(req_mx)

            picture_mx = np.asarray(
                bytearray(response_mx.read()), dtype="uint8")
            nparr_mx = np.frombuffer(picture_mx, np.uint8)
            img_mx = cv2.imdecode(nparr_mx, cv2.IMREAD_COLOR)

            s2 = img_mx[:, width_cutoff:]

            combined_img = np.hstack((s1, s2))

            cv2.imwrite('./static/satellite.jpg', combined_img)

            time.sleep(1)


@app.route("/", methods=['GET', 'POST'])
@app.route("/index", methods=['GET', 'POST'])
@cross_origin()
def hello():
    global cur_date, brightness, job_status, current_day_keys

    # hb = int(translate(brightness, 0.0, 1.0, 0, 255))
    # hexbrightness = "{0:x}{0:x}{0:x}".format(
    #     hb, hb, hb)

    return render_template('index.html', title='Status', date=cur_date, status=job_status, result="./static/satellite.jpg")


@app.route("/image")
def get_Image():
    return send_file("./static/satellite.jpg", mimetype='image/jpeg')


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
                   'brightness': brightness, 'current_date': cur_date, 'status': job_status}
    return jsonify(output_data)


@app.route('/run-tasks/<year>/<month>/<day>/<hour>/<minute>')
def run_tasks(year=None, month=None, day=None, hour=None, minute=None):
    app.apscheduler.add_job(func=scheduled_task, trigger='date', run_date=datetime(
        int(year), int(month), int(day), int(hour), int(minute), 0), id="sun", replace_existing=True)

    return 'Scheduled several long running tasks.', 200


@app.route('/test')
def test():
    thread_dates = Thread(target=thread_function)
    thread_dates.start()
    thread = Thread(target=run_job)
    thread.start()

    return 'started task', 200


def scheduled_task():
    global cur_time, cur_date, brightness, suncycles, suncycles_length, job_status, current_day_keys
    print("starting..")
    job_status = "active!"
    thread_dates = Thread(target=thread_function)
    thread_dates.start()
    thread = Thread(target=run_job)
    thread.start()


def thread_function():
    global cur_time, cur_date, brightness, suncycles, suncycles_length, job_status, current_day_keys, elapsed
    print("thread function started!")
    job_status = "active!"
    start = time.time()
    time.process_time()
    while elapsed < totaltime:
        # while True:
        elapsed = time.time() - start
        cur_time = math.floor(elapsed)
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

        time.sleep(0.2)

        print(brightness)

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
    app.run(extra_files=extra_files)
