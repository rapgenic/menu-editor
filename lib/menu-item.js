'use babel'
/** @jsx etch.dom */

import {CompositeDisposable, Emitter} from 'atom';
import etch from 'etch';

export default class MenuItem {
  constructor (item, config, onDidChangeConfig, nocheck) {
    this.config = config;
    this.item = item;
    this.children = null;
    this.separator = false;
    this.emitter = new Emitter();
    this.nocheck = nocheck;

    this.emitter.on('did-change-config', onDidChangeConfig);

    if (this.label = this.item.label || this.item.sublabel || this.item.selector) {
      this.key = this.label;
      this.label = this.label.replace(/&(\D)/, function(match, group) {
        return `<u>${group}</u>`;
      });
    }

    if (this.item.type && this.item.type == 'separator') {
      this.separator = true;
    }

    if (this.item.command) {
      this.command = this.item.command;
      this.accelerator = acceleratorForCommand(this.item.command, this.item.selector);
    }

    if ((this.item.submenu && this.item.submenu.length > 0) || (this.item.items && this.item.items.length > 0)) {
      this.children = [];

      let subItems = this.item.submenu || this.item.items;

      for (subItem of subItems) {
        if (subItem.selector == null) {
          subItem.selector = this.item.selector;
        }
        // conditions for a menu item to be added
        if (
          subItem.submenu ||
          subItem.items ||
          (subItem.command && subItem.command != "application:reopen-project") ||
          (subItem.type && subItem.type == "separator")
        ) {
          this.children.push(new MenuItem(subItem, this.getChildrenConfig(), onDidChangeConfig));
        }
      }
    }

    etch.initialize(this);

    this.fill();
  }

  createConfigValueIfNeeded() {
    if (!this.config[this.key]) {
      this.config[this.key] = {
        enabled: true,
        children: {}
      };
    }
  }

  getConfigValue() {
    this.createConfigValueIfNeeded();
    return this.config[this.key].enabled;
  }

  setConfigValue(val) {
    this.createConfigValueIfNeeded();
    this.config[this.key].enabled = val;
    this.emitter.emit('did-change-config');
  }

  getChildrenConfig() {
    this.createConfigValueIfNeeded();
    return this.config[this.key].children;
  }

  fill () {
    if (this.children) {
      this.refs.label.innerHTML = this.label;

      for (child of this.children) {
        this.refs.children.appendChild(child.element);
      }

      if (!this.nocheck) {
        this.refs.checkbox.checked = this.getConfigValue();
      }
    } else if (this.separator) {
      // Do nothing
    } else {
      this.refs.label.innerHTML = this.label;
      this.refs.keybinding.innerHTML = this.accelerator;
      // TODO: replace this with proper CSS spacing
      this.refs.command.innerHTML = " (" + this.command + ") ";

      if (this.item.devMode) {
        this.refs.entry.innerHTML += "<span class='highlight-error'>DEV</span>"
      }

      this.refs.checkbox.checked = this.getConfigValue();
    }
  }

  destroy () {
    return etch.destroy(this);
  }

  update (props, children) {
    return etch.update(this);
  }

  render () {
    if (this.children) {
      if (this.nocheck) {
        return (
          <li ref='entry' className="submenu-item entry list-nested-item project-root collapsed">
            <div className="header list-item" on={{click: this.didClick}}>
              <span ref='label' className="name icon icon-file-directory"></span>
            </div>
            <ol ref='children' className="entries list-tree"></ol>
          </li>
        );
      } else {
        return (
          <li ref='entry' className="submenu-item entry list-nested-item project-root collapsed">
            <div className="header list-item" on={{click: this.didClick}}>
              <input ref='checkbox' type="checkbox" class="input-checkbox" on={{change: this.toggleEnabled, click: (e) => { e.stopPropagation() }}}/>
              <span ref='label' className="name"></span>
            </div>
            <ol ref='children' className="entries list-tree"></ol>
          </li>
        );
      }
    } else if (this.separator) {
      return (
        <li ref='entry' className="separator-item entry list-item">
          <hr/>
        </li>
      );
    } else {
      return (
        <li ref='entry' className="menu-item entry list-item">
          <span ref='keybinding' className="pull-right key-binding"></span>
          <input ref='checkbox' type="checkbox" class="input-checkbox" on={{change: this.toggleEnabled}}/>
          <span ref='label' className="name"></span>
          <span ref='command' className="text-subtle"></span>
        </li>
      );
    }
  }

  didClick() {
    if (this.children && (this.nocheck || this.refs.checkbox.checked)) {
      if (this.refs.entry.classList.contains("collapsed")) {
        this.refs.entry.classList.remove("collapsed");
        this.refs.entry.classList.add("expanded");
      } else if (this.refs.entry.classList.contains("expanded")) {
        this.refs.entry.classList.remove("expanded");
        this.refs.entry.classList.add("collapsed");
      }
    }
  }

  toggleEnabled() {
    this.setConfigValue(this.refs.checkbox.checked);

    if (this.children && !this.refs.checkbox.checked && this.refs.entry.classList.contains("expanded")) {
      this.refs.entry.classList.remove("expanded");
      this.refs.entry.classList.add("collapsed");
    }
  }
}

var acceleratorForCommand = function(command, selector) {
  var binding, key, keys, keystroke, modifiers, ref;
  binding = atom.keymaps.findKeyBindings({
    command: command,
    target: selector && document.querySelector(selector)
  });
  keystroke = binding != null ? (ref = binding[0]) != null ? ref.keystrokes : void 0 : void 0;
  if (!keystroke) {
    return null;
  }
  modifiers = keystroke.split(/-(?=.)/);
  key = modifiers.pop().toUpperCase().replace('+', 'Plus');
  modifiers = modifiers.map(function(modifier) {
    return modifier.replace(/shift/ig, "Shift").replace(/cmd/ig, "Command").replace(/ctrl/ig, "Ctrl").replace(/alt/ig, "Alt");
  });
  keys = modifiers.concat([key]);
  return keys.join("+");
};
