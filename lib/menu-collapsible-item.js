'use babel';
// Necessary for render syntax to work
/** @jsx etch.dom */

import etch from 'etch';

export default class MenuCollapsibleItem {
  constructor (properties, children) {
    this.properties = properties;
    this.children = children;

    etch.initialize(this);
  }

  render () {
    let iconbox;

    if (this.properties.checkbox) {
      iconbox = <input ref='checkbox' type='checkbox' className='input-checkbox' checked={this.properties.checked} on={{change: this.onChange, click: (e) => { e.stopPropagation(); }}} />;
    } else if (this.properties.icon) {
      iconbox = <span className={`icon icon-${this.properties.icon}`}></span>;
    }

    return (
      <li ref='item' className='list-nested-item collapsed'>
        <div className='list-item' on={{click: this.toggle}}>
          {iconbox}
          <span innerHTML={this.properties.name} />
        </div>
        <ul className='list-tree'>
          {this.children}
        </ul>
      </li>
    );
  }

  onChange () {
    this.properties.checked = this.refs.checkbox.checked;

    if (this.properties.checkbox && !this.refs.checkbox.checked) {
      this.refs.item.classList.add('collapsed');
    }

    this.properties.on.change(this.properties.key, this.properties.checked);
  }

  toggle () {
    if (!this.properties.checkbox || this.refs.checkbox.checked) {
      if (this.refs.item.classList.contains('collapsed')) {
        this.refs.item.classList.remove('collapsed');
      } else {
        this.refs.item.classList.add('collapsed');
      }
    }
  }

  update (properties, children) {
    if (this.properties !== properties || this.children !== children) {
      this.properties = properties;
      this.children = children;
      return etch.update(this);
    }

    return Promise().resolve();
  }

  async destroy () {
    await etch.destroy(this);
  }
}
