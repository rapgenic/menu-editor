'use babel';
// Necessary for render syntax to work
/** @jsx etch.dom */

import etch from 'etch';

/**
 * Etch component representing the main settings panel, it is to be inserted in
 * the settings view, as one of the main panes (Differently from the package
 * settings)
 */
export default class MenuEditorPanel {
  /**
   * @param  {MenuManager} menuManager menuManager instance
   */
  constructor(menuManager) {
    this.menuManager = menuManager;

    // Initialize etch
    etch.initialize(this);
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
  // eslint-disable-next-line no-unused-vars
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
                <ul className='list-tree has-collapsable-children'>
                  {this.menuManager.getVisualMainMenuManager()}
                </ul>
              </div>
            </section>
            <section className='sub-section'>
              <h3 ref='contextMenuHeader' className='sub-section-heading icon icon-list-unordered'>Context Menu</h3>
              <div className='container'>
                <ul className='list-tree has-collapsable-children'>
                </ul>
              </div>
            </section>
          </div>
        </section>
      </div>
    );
  }

  /********************************************
   * Functions present in settings-view panes *
   ********************************************/

  focus () {
    this.element.focus();
  }

  show () {
    this.element.style.display = '';
  }

  scrollUp () {
    this.element.scrollTop -= document.body.offsetHeight / 20;
  }

  scrollDown () {
    this.element.scrollTop += document.body.offsetHeight / 20;
  }

  pageUp () {
    this.element.scrollTop -= this.element.offsetHeight;
  }

  pageDown () {
    this.element.scrollTop += this.element.offsetHeight;
  }

  scrollToTop () {
    this.element.scrollTop = 0;
  }

  scrollToBottom () {
    this.element.scrollTop = this.element.scrollHeight;
  }
}
