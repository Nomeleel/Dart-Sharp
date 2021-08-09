import * as fs from "fs";
import { CodeAction, CodeActionKind, CodeActionProvider, Disposable, languages, Position, Selection, TextDocument, TextEditor, Uri, window, workspace } from "vscode";
import { DART_MODE } from "../constant/constant";

const leftBracket = '(';
const rightBracket = ')';
const snippetFilePath = '.vscode/wrap.code-snippets';
export class DatWrapCodeActionProvider implements CodeActionProvider {

  public disposables: Disposable[] = [];
  public snippetList?: Snippet[];

  // this.disposables.push(window.onDidChangeActiveTextEditor((e) => );
  // this.disposables.push(workspace.onDidChangeConfiguration((e) => );
  
  constructor() {
    this.disposables.push(
      languages.registerCodeActionsProvider(
        DART_MODE,
        this
      ),
      workspace.onDidSaveTextDocument((e) => this.listenSnippetFile(e)),
    );
  }

  public async provideCodeActions(): Promise<CodeAction[]> {
    const editor = window.activeTextEditor;
    if (editor) {
      let selection = this.getWidgetSelection(editor);
      if (selection) {
        // this.snippetList ??= await this.getSnippetList();
        if (!this.snippetList) {
          this.snippetList = await this.getSnippetList();
          if (!this.snippetList) return [];
        }

        return this.snippetList.map((snippet) => {
          let action = new CodeAction(`Wrap with 👉${snippet.name}👈`, CodeActionKind.Refactor);
          action.command = {
            title: snippet.name,
            command: 'dart_sharp.wrapSnippet',
            arguments: [selection, snippet.bodyText],
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

  private async getSnippetList(snippetFileUri? : Uri) : Promise<Snippet[] | undefined>{
    if (!snippetFileUri) {
      let snippetFile = await workspace.findFiles(snippetFilePath);
      if (snippetFile.length == 0) return;
      snippetFileUri = snippetFile[0];
    }
    
    try {
      let snippetContent = fs.readFileSync(snippetFileUri.path, 'utf-8');
      let snippetMap = new Map(Object.entries<Snippet>(JSON.parse(snippetContent)));
      let snippetList: Snippet[] = [];
      snippetMap.forEach((snippet, name) => {
        snippetList.push(new Snippet(name, snippet.body));
      });
      return snippetList;
    } catch (error) {
      // TODO Snippet文件编辑过程中可能序列化失败, 忽略
    }
  }

  private async listenSnippetFile(textDocument: TextDocument) : Promise<any> {
    if (textDocument.uri.path.endsWith(snippetFilePath)) {
      let snippetList = await this.getSnippetList(textDocument.uri);
      if (snippetList) {
        this.snippetList = snippetList;
      }
    }
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}

class Snippet {
	public name: string;
	public body: string | string[];
  public get bodyText() {
    if (this.body instanceof Array) {
      return this.body.join('\n');
    }
    return this.body.toString();
}

	constructor(name: string, body: string | string[]) {
		this.name = name;
		this.body = body;
	}
}