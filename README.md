
# thermal-control

Monitor HP server system temperature with hpasmcli and activate HVAC fan with a Nest thermostat when a threshold is reached

## Get your Google OAuth2 access_token
Follow the instructions from the link or watch the YouTube video below.
https://developers.google.com/nest/device-access/get-started

https://www.youtube.com/watch?t=278&v=_Wex2SLmEJ8&feature=youtu.be

## Clone this Github repo
```
git clone https://github.com/lspiehler/thermal-control.git
cd thermal-control
```

## Set your environment variables
Example below sets the environment variables using "dotenv". "fan_duration" represents the time in seconds that the fan should run when the threshold is reached. "threshold" represents the sum of all system board temperatures. When the collective temperatures reach this value, the fan will be turned on for the specified duration.
```
cat << EOF > .env
access_token=<your access_token from instructions above>
client_id=<your client_id from instructions above>
client_secret=<your client_secret from instructions above>
refresh_token=<your refresh_token from instructions above>
project_id=<your project_id from instructions above>
device_id=<your device_id from instructions above>
fan_duration=900
threshold=1600
EOF
```

## Start the process
```
node index.js
```
Example output:
```
Mon Jan 25 2021 06:06:09 GMT-0600 (Central Standard Time) - 1603
Mon Jan 25 2021 06:06:09 GMT-0600 (Central Standard Time) - Temperature threshold exceeded. Starting fan.
Mon Jan 25 2021 06:06:14 GMT-0600 (Central Standard Time) - 1603
Mon Jan 25 2021 06:06:14 GMT-0600 (Central Standard Time) - Temperature threshold exceeded, but wait timer hasn't expired.
Mon Jan 25 2021 06:06:19 GMT-0600 (Central Standard Time) - 1603
Mon Jan 25 2021 06:06:19 GMT-0600 (Central Standard Time) - Temperature threshold exceeded, but wait timer hasn't expired.
Mon Jan 25 2021 06:06:24 GMT-0600 (Central Standard Time) - 1605
Mon Jan 25 2021 06:06:24 GMT-0600 (Central Standard Time) - Temperature threshold exceeded, but wait timer hasn't expired.
Mon Jan 25 2021 06:06:29 GMT-0600 (Central Standard Time) - 1605
Mon Jan 25 2021 06:06:29 GMT-0600 (Central Standard Time) - Temperature threshold exceeded, but wait timer hasn't expired.
Mon Jan 25 2021 06:06:34 GMT-0600 (Central Standard Time) - 1605
Mon Jan 25 2021 06:06:34 GMT-0600 (Central Standard Time) - Temperature threshold exceeded, but wait timer hasn't expired.
Mon Jan 25 2021 06:36:09 GMT-0600 (Central Standard Time) - Wait timer expired.
```