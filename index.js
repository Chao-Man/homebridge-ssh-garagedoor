var Service;
var Characteristic;

var ssh = require('ssh-exec'),
    assign = require('object-assign');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-ssh-garagedoor', 'SSH-GARAGE-DOOR', SshAccessory);
};

function SshAccessory(log, config) {
  this.log = log;
  this.service = 'Switch';

  this.name = config.name;
  this.openCommand = config.open;
  this.closeCommand = config.close;
  this.stateCommand = config.state;
  this.closedValue = config.closed_value || "";
  this.closedValue = this.closedValue.trim().toLowerCase();
  this.exactMatch = config.exact_match || true;
  this.ssh = assign({
    user: config.user,
    host: config.host,
    password: config.password,
    key: config.key
  }, config.ssh);
}

SshAccessory.prototype.matchesString = function(match) {
  if(this.exactMatch) {
    return (match === this.closedValue);
  }
  else {
    return (match.indexOf(this.closedValue) > -1);
  }
};

SshAccessory.prototype.setState = function(isOpen, callback) {
  var accessory = this;
  var state = isOpen ? 'open' : 'close';
  var prop = state + 'Command';
  var command = accessory[prop];

  var stream = ssh(command, accessory.ssh);

  stream.on('error', function (err) {
    accessory.log('Error: ' + err);
    callback(err || new Error('Error setting ' + accessory.name + ' to ' + state));
  });

  stream.on('finish', function () {
    accessory.log('Set ' + accessory.name + ' to ' + state);
    callback(null);
  });
};

SshAccessory.prototype.getState = function(callback) {
  var accessory = this;
  var command = accessory.stateCommand;

  var stream = ssh(command, accessory.ssh);

  stream.on('error', function (err) {
    accessory.log('Error: ' + err);
    callback(err || new Error('Error getting state of ' + accessory.name));
  });

  stream.on('data', function (data) {
    var state = data.toString('utf-8').trim().toLowerCase();
    accessory.log('State of ' + accessory.name + ' is: ' + state);
    callback(null, accessory.matchesString(state));
  });
};

SshAccessory.prototype.getServices = function() {
  var informationService = new Service.AccessoryInformation();
  var garageDoorService = new Service.GarageDoorOpener(this.name);

  informationService
  .setCharacteristic(Characteristic.Manufacturer, 'SSH Manufacturer')
  .setCharacteristic(Characteristic.Model, 'SSH Model')
  .setCharacteristic(Characteristic.SerialNumber, 'SSH Serial Number');

  garageDoorService.getCharacteristic(Characteristic.TargetDoorState)
  .on('set', this.setState.bind(this));

  if (this.stateCommand) {
    garageDoorService.getCharacteristic(Characteristic.CurrentDoorState)
    .on('get', this.getState.bind(this));
    garageDoorService.getCharacteristic(Characteristic.TargetDoorState)
    .on('get', this.getState.bind(this));
  }

  return [garageDoorService];
};
