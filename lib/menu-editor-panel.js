'use babel'
/** @jsx etch.dom */

import {CompositeDisposable, TextEditor} from 'atom'
import etch from 'etch';
import MenuItem from './menu-item';

// TODO: get collapsible sections to work

export default class MenuEditorPanel {
  constructor () {
    etch.initialize(this);

    this.subscriptions = new CompositeDisposable();

    this.fill();
  }

  destroy () {
    return etch.destroy(this);
  }

  update (props, children) {
    return etch.update(this);
  }

  render () {
    return (
      <div className='panels-item menu-editor' tabIndex='-1'>
        <section className='section'>
          <div className='section-container'>
            <div className='section-heading icon icon-list-unordered'>Menu Editor</div>
            <div></div>
            <div className='editor-container'>
              <TextEditor ref='filterEditor' mini={true} placeholderText='Filter menu entries by name' />
            </div>
            <section className='sub-section'>
              <h3 ref='mainMenuHeader' className='sub-section-heading icon icon-list-unordered has-items'>Main menu</h3>
              <div className='container'>
                <ol ref='mainMenu' className="full-menu list-tree has-collapsable-children"></ol>
              </div>
            </section>
            <section className='sub-section'>
              <h3 ref='contextMenuHeader' className='sub-section-heading icon icon-list-unordered has-items'>Context menu</h3>
              <div className='container'>
                <ol ref='contextMenu' className="full-menu list-tree has-collapsable-children"></ol>
              </div>
            </section>
          </div>
        </section>
      </div>
    );
  }

  fill () {
    for (item of atom.menu.template) {
      this.refs.mainMenu.appendChild(new MenuItem(item).element);
    }

    for (item of atom.contextMenu.itemSets) {
      this.refs.contextMenu.appendChild(new MenuItem(item).element);
    }
  }

  focus () {
    this.element.focus()
  }

  show () {
    this.element.style.display = ''
  }

  didClick (event) {
    const target = event.target.closest('.packages-open')
    if (target) {
      atom.workspace.open('atom://config/packages')
    }
  }

  scrollUp () {
    this.element.scrollTop -= document.body.offsetHeight / 20
  }

  scrollDown () {
    this.element.scrollTop += document.body.offsetHeight / 20
  }

  pageUp () {
    this.element.scrollTop -= this.element.offsetHeight
  }

  pageDown () {
    this.element.scrollTop += this.element.offsetHeight
  }

  scrollToTop () {
    this.element.scrollTop = 0
  }

  scrollToBottom () {
    this.element.scrollTop = this.element.scrollHeight
  }
}
