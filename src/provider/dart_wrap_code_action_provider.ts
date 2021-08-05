import { window, CodeAction, CodeActionProvider, CodeActionKind, Disposable, languages, commands, Position, Selection, TextEditor } from "vscode";
import { DART_MODE } from "../constant/constant";

const leftBracket = '(';
const rightBracket = ')';

export class DatWrapCodeActionProvider implements CodeActionProvider {

  public disposables: Disposable[] = [];

  // this.disposables.push(window.onDidChangeActiveTextEditor((e) => );
  // this.disposables.push(workspace.onDidChangeTextDocument((e) => );
  // this.disposables.push(workspace.onDidChangeConfiguration((e) => );

  constructor() {
    this.disposables.push(languages.registerCodeActionsProvider(
      DART_MODE,
      this
    ));
  }

  public async provideCodeActions(): Promise<CodeAction[]> {
    const editor = window.activeTextEditor;
    if (editor) {
      let selection = this.getWidgetSelection(editor);
      if (selection) {
        const curText = editor.document.getText(selection);
        return [
          {
            command: "dart-sharp.helloWorld2",
            title: "Wrap with helloWorld2",
          },
        ].map((c) => {
          let action = new CodeAction(c.title, CodeActionKind.Refactor);
          action.command = {
            command: c.command,
            title: c.title,
          };
          return action;
        });
      }
    }

    return [];
  }

  private getWidgetSelection(editor: TextEditor): Selection | undefined {
    const document = editor.document;
    let textRange = document.getWordRangeAtPosition(editor.selection.active, /(?<=\W+)(const )?[\w\.]*\(/); // (?=\()
    if (textRange) {
      for (let lineIndex = textRange.end.line, bracketCount = 1; lineIndex < document.lineCount; lineIndex++) {
        const curTextLine = document.lineAt(lineIndex);
        let charIndex = lineIndex === textRange.end.line ? textRange.end.character + 1 : curTextLine.firstNonWhitespaceCharacterIndex;
        for (charIndex; charIndex < curTextLine.text.length; charIndex++) {
          const curChar = curTextLine.text.charAt(charIndex);
          if (curChar === rightBracket) bracketCount--;
          if (curChar === leftBracket) bracketCount++;
          if (bracketCount === 0) {
            return new Selection(
              textRange.start,
              new Position(lineIndex, charIndex + 1),
            );
          }
        }
      }
    }
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}
