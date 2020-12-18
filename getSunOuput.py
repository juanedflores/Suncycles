import requests
import json
import random
import time
import argparse
import sys
from pythonosc import udp_client

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ip", default="127.0.0.1",
                        help="The ip of the OSC server")
    parser.add_argument("--port", type=int, default=6010,
                        help="The port the OSC server is listening on")
    args = parser.parse_args()

    client = udp_client.SimpleUDPClient(args.ip, args.port)

    while True:
        # r = requests.get('https://suncycles-phages.herokuapp.com/output')
        r = requests.get('http://localhost:5000/output')
        jsondata = r.json()
        brightness = jsondata["brightness"]
        print(brightness)

        client.send_message("/brightness", brightness)

        # if (jsondata["status"] == "inactive"):
        #     print("Ya no hay datos. Reinicia el reloj. Exiting..")
        #     sys.exit()

        # time.sleep()
