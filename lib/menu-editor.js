'use babel';

/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import MenuEditorPanel from './menu-editor-panel';

export default {

  panelName: 'Menu',
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register opener
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((item) => {
      console.log(item);

      if (item.uri && item.uri == 'atom://config') {
        // TODO: maybe we can use panelCreateCallbacks[this.panelName] to check for existence
        if (!item._menuEditorPanelAdded) {
          item.addCorePanel(this.panelName, 'list-unordered', () => new MenuEditorPanel());
          item._menuEditorPanelAdded = true;
        }
      }
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  }

};
