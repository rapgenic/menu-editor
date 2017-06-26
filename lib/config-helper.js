'use babel';

import fs from 'fs';
import _ from 'underscore-plus';

const CONFIG_VERSION = '0.0.1';

export default class Config {
  constructor (file) {
    this.file = file;
    this.configuration = {};

    this.loadConfiguration();
  }

  loadConfiguration () {
    // check for config file existence
    if (fs.existsSync(this.file)) {
      // load it into the configuration object and update the menus
      let configuration = JSON.parse(fs.readFileSync(this.file, 'utf8'));

      if (configuration.version == CONFIG_VERSION) {
        this.configuration = configuration;
      } else {
        this.configuration = Config.convert(configuration);
        this.saveConfiguration();
        atom.notifications.addSuccess('Menu Editor configuration was updated', {
          description: `Menu Editor configuration file (${this.file}) was updated to version ${CONFIG_VERSION}`
        });
      }
    } else {
      // save an empty configuration. see @this.configuration
      this.saveConfiguration();
    }
  }

  saveConfiguration () {
    // Just stringify the object
    fs.writeFileSync(this.file, JSON.stringify(this.configuration, null, '\t'));
  }

  get (config_key) {
    let keys = config_key.split('>');

    let pointer = _.deepClone(this.configuration);

    for (let key of keys) {
      if (pointer[key] === undefined) {
        if (key == 'enabled') {
          pointer[key] = true;
        } else {
          pointer[key] = {};
        }
      }

      pointer = pointer[key];
    }

    return pointer;
  }

  set (config_key, val, config) {
    if (config === undefined) {
      this.set(config_key, val, this.configuration);
    } else {
      let keys = config_key.split('>');

      let key = keys[0];

      if (keys.length > 1) {
        keys.shift();
        this.set(keys.join('>'), val, config[key]);
      } else if (keys.length == 1) {
        config[key] = val;
        this.saveConfiguration();
      }
    }
  }

  static convert(configuration) {
    if (!configuration.version) {
      return {
        version: CONFIG_VERSION,
        mainMenu: Config.convertFromNoVersion(configuration.main),
        contextMenu: Config.convertFromNoVersion(configuration.context)
      };
    }
  }

  static convertFromNoVersion(configuration) {
    let newconf = {};

    for (let key in configuration) {
      if (configuration.hasOwnProperty(key)) {
        newconf[key] = {};

        if (configuration[key].enabled) {
          newconf[key].enabled = configuration[key].enabled;
        } else {
          newconf[key].enabled = false;
        }

        if (configuration[key].children) {
          let children = Config.convertFromNoVersion(configuration[key].children);

          for (let childKey in children) {
            newconf[key][childKey] = children[childKey];
          }
        }
      }
    }

    return newconf;
  }
}
