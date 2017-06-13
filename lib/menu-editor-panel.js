'use babel'
// Necessary for render syntax to work
/** @jsx etch.dom */

import {CompositeDisposable, TextEditor} from 'atom'
import etch from 'etch';
import MenuItem from './menu-item';

/**
 * Etch component representing the main settings panel, it is to be inserted in
 * the settings view, as one of the main panes (Differently from the package
 * settings)
 */
export default class MenuEditorPanel {
  /**
   * Constructor
   * @param  {Object} config            Menu editor config Object
   * @param  {Object} menu              Menu editor menu clone
   * @param  {Function} onDidChangeConfig Callback to be called when a checkbox
   *                                      is changed
   */
  constructor (config, menu, onDidChangeConfig) {
    this.config = config;
    this.menu = menu;
    this.onDidChangeConfig = onDidChangeConfig;

    // Initialize etch
    etch.initialize(this);

    this.subscriptions = new CompositeDisposable();

    // Populate dom with actual elements
    this.fill();
  }

  /**
   * Default etch api destroy
   */
  destroy () {
    return etch.destroy(this);
  }

  /**
   * Default etch api update
   */
  update (props, children) {
    return etch.update(this);
  }

  /**
   * Default etch api render
   * @return {Object} HTML dom element
   */
  render () {
    // Very similar to what can be found in settings-view package
    return (
      <div className='panels-item menu-editor' tabIndex='-1'>
        <section className='section'>
          <div className='section-container'>
            <div className='section-heading icon icon-list-unordered'>Menu Editor</div>
            <div className='text icon icon-question'>
              Here you can edit your main (upper) and context (right click) menus by unckecking the items you do not like
            </div>
            <section className='sub-section'>
              <h3 ref='mainMenuHeader' className='sub-section-heading icon icon-list-unordered'>Main Menu</h3>
              <div className='container'>
                <ol ref='mainMenu' className="full-menu list-tree has-collapsable-children"></ol>
              </div>
            </section>
            <section className='sub-section'>
              <h3 ref='contextMenuHeader' className='sub-section-heading icon icon-list-unordered'>Context Menu</h3>
              <div className='container'>
                <ol ref='contextMenu' className="full-menu list-tree has-collapsable-children"></ol>
              </div>
            </section>
          </div>
        </section>
      </div>
    );
  }

  /**
   * Fills the page with @MenuItems, corresponding to the atom menu elements
   * each @MenuItem will be filling itself recusively
   */
  fill () {
    // Main menu
    for (item of this.menu.main) {
      this.refs.mainMenu.appendChild(new MenuItem(item, this.config.main, this.onDidChangeConfig).element);
    }

    // Context menu
    for (item of this.menu.context) {
      this.refs.contextMenu.appendChild(new MenuItem(item, this.config.context, this.onDidChangeConfig, true).element);
    }
  }

  /********************************************
   * Functions present in settings-view panes *
   ********************************************/

  focus () {
    this.element.focus()
  }

  show () {
    this.element.style.display = ''
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
