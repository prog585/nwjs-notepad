var cutButton, copyButton, pasteButton, newButton, openButton, saveButton;
var editor;
var menu;
var fileEntry;
var hasWriteAccess;

var gui = require('nw.gui');
var fs = require('fs');
var clipboard = gui.Clipboard.get();
var win = gui.Window.get();

// Extend application menu for Mac OS
if (process.platform == 'darwin') {
  var menu = new gui.Menu({ type: 'menubar' });
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  gui.Window.get().menu = menu;
}

function handleDocumentChange(title) {
  if (title) {
    title = title.match(/[^/]+$/)[0];
    document.getElementById('title').innerHTML = title;
    document.title = title;
  } else {
    document.getElementById('title').innerHTML = '[no document loaded]';
  }
}
function setFile(theFileEntry, isWritable) {
  fileEntry = theFileEntry;
  hasWriteAccess = isWritable;
}

function readFileIntoEditor(theFileEntry) {
  fs.readFile(theFileEntry, function (err, data) {
    if (err) {
      console.log('Read failed: ' + err);
    }

    handleDocumentChange(theFileEntry);
    document.getElementById('editor').innerText = String(data);
  });
}
function initContextMenu() {
  menu = new gui.Menu();
  menu.append(
    new gui.MenuItem({
      label: 'Copy',
      click: handleCopyButton,
    })
  );
  menu.append(
    new gui.MenuItem({
      label: 'Cut',
      click: handleCutButton,
    })
  );
  menu.append(
    new gui.MenuItem({
      label: 'Paste',
      click: handlePasteButton,
    })
  );

  document
    .getElementById('editor')
    .addEventListener('contextmenu', function (ev) {
      ev.preventDefault();
      menu.popup(ev.x, ev.y);
      return false;
    });
}
function getSelectionText() {
  var text = '';
  if (win.window.getSelection) {
    text = win.window.getSelection().toString();
  } else if (document.selection && document.selection.type != 'Control') {
    text = document.selection.createRange().text;
  }
  return text;
}
function replaceSelectedText(replacementText) {
  var sel, range;
  if (win.window.getSelection) {
    sel = win.window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(replacementText));
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    range.text = replacementText;
  }
}
function handleCopyButton() {
  clipboard.set(getSelectionText());
}
function handlePasteButton() {
  replaceSelectedText(clipboard.get());
}
function handleCutButton() {
  clipboard.set(getSelectionText());
  replaceSelectedText('');
}
function handleNewButton() {
  if (false) {
    newFile();
    editor.setValue('');
  } else {
    var x = window.screenX + 10;
    var y = window.screenY + 10;
    window.open('index.html', '_blank', 'screenX=' + x + ',screenY=' + y);
  }
}
function newFile() {
  fileEntry = null;
  hasWriteAccess = false;
  handleDocumentChange(null);
}
function handleOpenButton() {
  $('#openFile').trigger('click');
}
var onChosenFileToOpen = function (theFileEntry) {
  setFile(theFileEntry, false);
  readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function (theFileEntry) {
  setFile(theFileEntry, true);
  writeEditorToFile(theFileEntry);
};
function writeEditorToFile(theFileEntry) {
  var str = document.getElementById('editor').innerText;
  fs.writeFile(theFileEntry, str, function (err) {
    if (err) {
      console.log('Write failed: ' + err);
      return;
    }

    handleDocumentChange(theFileEntry);
    console.log('Write completed.');
  });
}
function handleSaveButton() {
  if (fileEntry && hasWriteAccess) {
    writeEditorToFile(fileEntry);
  } else {
    $('#saveFile').trigger('click');
  }
}

onload = function () {
  initContextMenu();

  cutButton = document.getElementById('cut');
  copyButton = document.getElementById('copy');
  pasteButton = document.getElementById('paste');
  newButton = document.getElementById('new');
  openButton = document.getElementById('open');
  saveButton = document.getElementById('save');

  cutButton.addEventListener('click', handleCutButton);
  copyButton.addEventListener('click', handleCopyButton);
  pasteButton.addEventListener('click', handlePasteButton);
  newButton.addEventListener('click', handleNewButton);
  openButton.addEventListener('click', handleOpenButton);
  saveButton.addEventListener('click', handleSaveButton);

  $('#saveFile').change(function (evt) {
    var str = $(this).val();
    onChosenFileToSave(str);
  });
  $('#openFile').change(function (evt) {
    onChosenFileToOpen($(this).val());
  });
  newFile();
  onresize();
  gui.Window.get().show();
};
onresize = function () {
  var container = document.getElementById('editor');
  var containerWidth = container.offsetWidth;
  var containerHeight = container.offsetHeight;
  /*
  var scrollerElement = editor.getScrollerElement();
  scrollerElement.style.width = containerWidth + 'px';
  scrollerElement.style.height = containerHeight + 'px';
*/
  //editor.refresh();
};
