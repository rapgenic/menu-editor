'use babel';
// Necessary for render syntax to work
/** @jsx etch.dom */

import _ from 'underscore-plus';
import MenuItem from './menu-item';
import MenuCollapsibleItem from './menu-collapsible-item';
import MenuSeparatorItem from './menu-separator-item';
// eslint-disable-next-line no-unused-vars
import etch from 'etch';

export default class MenuManager {
  constructor (configHelper) {
    this.configHelper = configHelper;

    this.cloneMainMenu();
  }

  cloneMainMenu() {
    this.deepMainMenu = _.deepClone(atom.menu.template);
  }

  restoreMainMenu() {
    atom.menu.template = _.deepClone(this.deepMainMenu);
  }

  getVisualMainMenuManager (menu, key) {
    // Non recursive section
    if (menu === undefined && key === undefined) {
      return this.getVisualMainMenuManager(atom.menu.template, 'mainMenu');
    // Recursive section
    } else {
      let elements = [];

      for (let item of menu) {
        let e = {};
        let itemKey = `${key}.${item.label}`;
        let enabledKey = `${itemKey}.enabled`;
        let checked = this.configHelper.get(enabledKey);
        let label = item.label ? item.label.replace(/&(\D)/, (match, group) => { return `<u>${group}</u>`; }) : undefined;

        if (item.type !== undefined && item.type == 'separator') {
          e = <MenuSeparatorItem/>;
        } else if (item.submenu !== undefined) {
          e = (
            <MenuCollapsibleItem icon='file-directory' checked={checked} name={label} on={{change: this.onToggleItem.bind(this)}} key={enabledKey}>
              {this.getVisualMainMenuManager(item.submenu, itemKey)}
            </MenuCollapsibleItem>
          );
        } else if (item.command && item.command != 'application:reopen-project') {
          e = <MenuItem name={label} command={item.command} keybinding={'hello'} checked={checked} on={{change: this.onToggleItem.bind(this)}} key={enabledKey}></MenuItem>;
        }

        elements.push(e);
      }

      return elements;
    }
  }

  onToggleItem(key, val) {
    this.configHelper.set(key, val);

    if (key.split('.')[0] == 'mainMenu') {
      this.updateMainMenu();
    }
  }

  updateMainMenu(key, menu) {
    if (key == undefined || menu == undefined) {
      this.restoreMainMenu();
      this.updateMainMenu('mainMenu', atom.menu.template);
      atom.menu.update();
    } else {
      let length = menu.length;

      // Cycle trough all the top menu elements
      for (let i = 0; i < length; i++) {
        let item = menu[i];

        // if disabled delete it
        if (!this.configHelper.get(`${key}.${item.label}.enabled`)) {
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
            this.updateMainMenu(`${key}.${item.label}`, item.submenu);
          }
        }
      }
    }
  }
}
