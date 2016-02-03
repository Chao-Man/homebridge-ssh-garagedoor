homebridge-ssh-garagedoor
==============

Supports triggering ssh commands on the HomeBridge platform.

## Credit

Fork of zb0th's homebridge-ssh: ```https://github.com/zb0th/homebridge-ssh```

I modified the script to comply with ```Service.GarageDoorOpener``` to enable the command:
>
"siri, open the garage door"

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-ssh-garagedoor`
3. Update your configuration file. See `sample-config.json` in this repository for a sample.

## Configuration

Configuration sample:

```
"accessories": [
{
  "accessory": "SSH-GARAGE-DOOR",
  "name": "Garage Door",
  "open": "./open.sh",
  "close": "./close.sh",
  "state": "./check_state.sh",
  "closed_value" : "closed",
  "exact_match": true,
  "ssh": {
    "user": "user",
    "host": "MR3020",
    "port": 22,
    "password": "password"
  }
}
]
```
