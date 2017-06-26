'use babel';
// Necessary for render syntax to work
/** @jsx etch.dom */

import etch from 'etch';

export default class MenuItem {
  constructor (properties) {
    this.properties = properties;

    etch.initialize(this);
  }

  render () {
    return (
      <li ref='item' className='list-item'>
        <kbd className='key-binding pull-right'>{this.properties.keybinding}</kbd>
        <input ref='checkbox' type='checkbox' className='input-checkbox' checked={this.properties.checked} on={{change: this.onChange}}/>
        <span innerHTML={this.properties.name} />
        <span className="text-subtle command">{`(${this.properties.command})` || ''}</span>
      </li>
    );
  }

  onChange () {
    this.properties.checked = this.refs.checkbox.checked;
    this.properties.on.change(this.properties.key, this.properties.checked);
  }

  update (properties) {
    if (this.properties !== properties) {
      this.properties = properties;
      return etch.update(this);
    }

    return Promise().resolve();
  }

  async destroy () {
    await etch.destroy(this);
  }
}
