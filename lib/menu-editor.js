'use babel';

/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import MenuEditorPanel from './menu-editor-panel';
import path from 'path';
import fs from 'fs';
import _ from 'underscore-plus';

export default {

  panelName: 'Menu',
  subscriptions: null,

  /**
   * Stores the configuration loaded from the external file
   * @type {Object}
   */
  configuration: {
    main: {},
    context: {}
  },
  /**
   * Stores a deep copy of the menus to be kept as a reference
   * @type {Object}
   */
  menu: {},

  /**
   * Default atom api activate call
   * @param  {Object} state serialized state
   */
  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Wait for every package to have loaded, so that the menus are populated
    this.subscriptions.add(atom.packages.onDidActivateInitialPackages(() => {
      // Create a clone of the two menus, so that the settings view can be populated
      // with the correct items
      this.menu = {
        main: _.deepClone(atom.menu.template),
        context: _.deepClone(atom.contextMenu.itemSets)
      };

      // load the previous settings from the config file
      this.loadConfiguration();

      // Inject the new panel in settings-view when we open the settings
      this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
        // Avoid any possible undefined errors
        if (item && item.uri && item.uri == 'atom://config') {
          // TODO: maybe we can use panelCreateCallbacks[this.panelName] to check for existence
          if (!item._menuEditorPanelAdded) {
            item.addCorePanel(this.panelName, 'list-unordered', () => new MenuEditorPanel(this.configuration, this.menu, () => this.onDidChangeConfig()));
            // A variable that confirms that we've already added a panel
            // to the settings panel. see before
            item._menuEditorPanelAdded = true;
          }
        }
      }));
    }));
  },

  /**
   * Update atom menus depending on the configuration
   */
  updateMenus() {
    atom.menu.template = _.deepClone(this.menu.main);
    this.updateMainMenus(this.configuration.main, atom.menu.template);
    atom.menu.update();

    atom.contextMenu.itemSets = _.deepClone(this.menu.context);
    this.updateContextMenus(this.configuration.context, atom.contextMenu.itemSets);
  },

  /**
   * Update recusively the main menu, reading from the config
   * @param  {Object} config the configuration relative to @menu
   * @param  {Object} menu   the menu subset
   */
  updateMainMenus(config, menu) {
    let length = menu.length;

    // Cycle trough all the top menu elements
    for (let i = 0; i < length; i++) {
      let item = menu[i];

      // See if a config setting is available for that entry
      // if not just skip the entry (aka keep it in the menu)
      if (!config[item.label]) {
        continue;
      }

      // if disabled delete it
      if (!config[item.label].enabled) {
        // atom.MenuManager internal call, basically it removes the @item
        // from the @menu
        menu.splice(menu.indexOf(item), 1);
        // IMPORTANT: menu array has shortened, we need to pull back the
        // counter and the length
        i--;
        length--;
      } else {
        // otherwise if it has submenus, just call @updateMainMenus recursively
        if (item.submenu) {
          this.updateMainMenus(config[item.label].children, item.submenu);
        }
      }
    }
  },

  updateContextMenus(config, menu) {
    let length = menu.length;

    for (let i = 0; i < length; i++) {
      let item = menu[i];
      let label = item.label || item.selector;

      // See if a config setting is available for that entry
      // if not just skip the entry (aka keep it in the menu)
      if (!config[label]) {
        continue;
      }

      // if disabled delete it
      if (!config[label].enabled) {
        // atom.MenuManager internal call, basically it removes the @item
        // from the @menu
        menu.splice(menu.indexOf(item), 1);
        // IMPORTANT: menu array has shortened, we need to pull back the
        // counter and the length
        i--;
        length--;
      } else {
        // otherwise if it has submenus, just call @updateContextMenus recursively
        if (item.items) {
          this.updateContextMenus(config[label].children, item.items);
        }
      }
    }
  },

  /**
   * Callback for when a checkbox in the settings view changes its value
   */
  onDidChangeConfig() {
    // Save configuration to a file
    this.saveConfiguration();
    // The configuration has just changed, we need to update the menus
    this.updateMenus();
  },

  /**
   * Return default config file path (in atom config path directory, usually
   * "~/.atom")
   * @return {String} config file path
   */
  getConfigPath() {
    return path.join(atom.getConfigDirPath(), 'menu-config.json');
  },

  /**
   * Loads configuration from the default config file and saves it to the
   * @this.configuration object. if it doesn't exist just create it with an
   * empty configuration.
   */
  loadConfiguration() {
    // check for config file existence
    if (fs.existsSync(this.getConfigPath())) {
      // load it into the configuration object and update the menus
      this.configuration = JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8'));
      this.updateMenus();
    } else {
      // save an empty configuration. see @this.configuration
      this.saveConfiguration();
    }
  },

  /**
   * Save the @this.configuration to the default file
   */
  saveConfiguration() {
    // Just stringify the object
    fs.writeFileSync(this.getConfigPath(), JSON.stringify(this.configuration, null, "\t"));
  },

  /**
   * Default atom api deactivate call
   */
  deactivate() {
    this.subscriptions.dispose();
  }

};
