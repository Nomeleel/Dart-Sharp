import * as fs from "fs";
import { CodeAction, CodeActionKind, CodeActionProvider, Disposable, languages, Position, Selection, TextEditor, window, workspace } from "vscode";
import { DART_MODE } from "../constant/constant";

const leftBracket = '(';
const rightBracket = ')';

export class DatWrapCodeActionProvider implements CodeActionProvider {

  public disposables: Disposable[] = [];
  public snippetList?: Snippet[];

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
        const selectionText = editor.document.getText(selection);

        // this.snippetList ??= await this.getSnippetList();
        if (!this.snippetList) {
          this.snippetList = await this.getSnippetList();
        }
    
        return this.snippetList.map((snippet) => {
          let action = new CodeAction(`Wrap with 👉${snippet.name}👈`, CodeActionKind.Refactor);
          action.command = {
            title: snippet.name,
            command: '',
            arguments: [],
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

  private async getSnippetList() : Promise<Snippet[]>{
    let snippetFile = await workspace.findFiles('.vscode/wrap.code-snippets');
    if (snippetFile.length > 0) {
      let snippetContent = fs.readFileSync(snippetFile[0].path, 'utf-8');
      let snippetMap = new Map(Object.entries<Snippet>(JSON.parse(snippetContent)));
      let snippetList: Snippet[] = [];
      snippetMap.forEach((snippet, name) => {
        snippet.name = name;
        snippetList.push(snippet);
      });
      return snippetList;
    }

    return [];
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}

class Snippet {
	public name: string;
	public body: string;

	constructor(name: string, body: string) {
		this.name = name;
		this.body = body;
	}
}