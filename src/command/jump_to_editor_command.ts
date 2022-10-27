import { commands, Position, Range, Selection, TextEditor, TextEditorRevealType, Uri, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { JUMP_TO_EDITOR_COMMAND } from "../constant/constant";
import { openTextDocument } from "../util/document";
import { isString, rangesOfOne } from "../util/util";

export class JumpToEditorCommand extends DisposableBase  {

	constructor() {
    super();
		this.disposables.push(
			commands.registerCommand(JUMP_TO_EDITOR_COMMAND, JumpToEditorCommand.jumpToEditor, this),
		);
  }

  static async jumpToEditor(editor?: TextEditor | string | Uri, target?: String | Range, selectionRange?: Range) {
    let activeEditor: TextEditor;
    if (!editor) {
      activeEditor = window.activeTextEditor!;
    } else {
      if(typeof(editor) === 'string' || editor instanceof Uri) {
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