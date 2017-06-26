'use babel';

/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import path from 'path';
import _ from 'underscore-plus';

import MenuManager from './menu-manager';
import MenuEditorPanel from './menu-editor-panel';
import ConfigHelper from './config-helper';

export default {

  panelName: 'Menu',
  subscriptions: null,

  /**
   * Default atom api activate call
   * @param  {Object} state serialized state
   */
  // eslint-disable-next-line no-unused-vars
  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.configHelper = new ConfigHelper(this.getConfigPath());
    this.menuManager = new MenuManager(this.configHelper);

    // Wait for every package to have loaded, so that the menus are populated
    this.subscriptions.add(atom.packages.onDidActivateInitialPackages(() => {
      // Create a clone of the two menus, so that the settings view can be populated
      this.menuManager.updateMainMenu();

      // Inject the new panel in settings-view when we open the settings
      this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
        // Avoid any possible undefined errors
        if (item && item.uri && item.uri == 'atom://config') {
          // TODO: maybe we can use panelCreateCallbacks[this.panelName] to check for existence
          if (!item._menuEditorPanelAdded) {
            item.addCorePanel(this.panelName, 'list-unordered', () => new MenuEditorPanel(this.menuManager));
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
   * Return default config file path (in atom config path directory, usually
   * "~/.atom")
   * @return {String} config file path
   */
  getConfigPath() {
    return path.join(atom.getConfigDirPath(), 'menu-config.json');
  },

  /**
   * Default atom api deactivate call
   */
  deactivate() {
    this.subscriptions.dispose();
  }

};
