import { commands, Position, Range, Selection, TextEditor, TextEditorRevealType, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { isString, openTextDocument, rangesOfOne } from "../util/util";

export class JumpToEditorCommand extends DisposableBase  {

	constructor() {
    super();
		this.disposables.push(
			commands.registerCommand("dart_sharp.jumpToEditor", JumpToEditorCommand.jumpToEditor, this),
		);
  }

  static async jumpToEditor(editor?: TextEditor | string, target?: String | Range, selectionRange?: Range) {
    let activeEditor: TextEditor;
    if (!editor) {
      activeEditor = window.activeTextEditor!;
    } else {
      if(typeof(editor) === 'string') {
        activeEditor = await openTextDocument(editor);
      } else {
        activeEditor = editor;
      }
    }

    let displayRange : Range | undefined;
    
    if (target) {
      if (isString(target)) {
        console.log(target.toString());
        displayRange = rangesOfOne(activeEditor, target.toString());
        selectionRange = displayRange;
      } else if (target instanceof Range) {
        displayRange = target;
      } else {
        // Nothing to do.
      }
    } 

    if (!displayRange) {
      displayRange = new Range(new Position(0, 0), new Position(0, 0));
    }

    if (selectionRange) {
      activeEditor.selection = new Selection(selectionRange.start, selectionRange.end);
    }

    activeEditor.revealRange(displayRange, TextEditorRevealType.InCenterIfOutsideViewport);
  }
}