'use babel';
// Necessary for render syntax to work
/** @jsx etch.dom */

import etch from 'etch';

export default class MenuSeparatorItem {
  constructor () {
    etch.initialize(this);
  }

  render () {
    return (
      <li ref='item' className='list-item'>
        <hr/>
      </li>
    );
  }

  update () {
    return etch.update(this);
  }

  async destroy () {
    await etch.destroy(this);
  }
}
