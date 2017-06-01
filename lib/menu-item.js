'use babel'
/** @jsx etch.dom */

import {CompositeDisposable} from 'atom';
import etch from 'etch';
import $ from 'jquery';

// TODO: fully migrate to jquery

export default class MenuItem {
  constructor (item) {
    console.log(item);
    this.item = item;
    this.children = null;
    this.separator = false;

    if (this.label = this.item.label || this.item.sublabel || this.item.selector) {
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

      var subItems = this.item.submenu || this.item.items;

      for (subItem of subItems) {
        if (subItem.selector == null) {
          subItem.selector = this.item.selector;
        }
        this.children.push(new MenuItem(subItem));
      }
    }

    etch.initialize(this);

    this.fill();
  }

  fill () {
    if (this.children) {
      this.refs.label.innerHTML = this.label;

      for (child of this.children) {
        this.refs.children.appendChild(child.element);
      }
    } else if (this.separator) {

    } else {
      this.refs.label.innerHTML = this.label;
      this.refs.keybinding.innerHTML = this.accelerator;
      // TODO: replace this with proper CSS spacing
      this.refs.command.innerHTML = " (" + this.command + ") ";

      if (this.item.devMode) {
        this.refs.entry.innerHTML += "<span class='highlight-error'>DEV</span>"
      }
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
      return (
        <li ref='entry' className="directory entry list-nested-item project-root collapsed">
          <div className="header list-item" on={{click: this.didClick}}>
            <span ref='label' className="name"></span>
          </div>
          <ol ref='children' className="entries list-tree"></ol>
        </li>
      );
    } else if (this.separator) {
      return (
        <li ref='entry' className="file entry list-item">
          <hr/>
        </li>
      );
    } else {
      return (
        <li ref='entry' className="file entry list-item">
          <span ref='keybinding' className="pull-right key-binding"></span>
          <input type="checkbox" class="input-checkbox"/>
          <span ref='label' className="name"></span>
          <span ref='command' className="text-subtle"></span>
        </li>
      );
    }
  }

  didClick() {
    if (this.children) {
      if ($(this.refs.entry).hasClass("collapsed")) {
        $(this.refs.entry).removeClass("collapsed");
        $(this.refs.entry).addClass("expanded");
      } else if ($(this.refs.entry).hasClass("expanded")) {
        $(this.refs.entry).removeClass("expanded");
        $(this.refs.entry).addClass("collapsed");
      }
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
