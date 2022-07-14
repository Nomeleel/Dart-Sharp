import * as fs from "fs";
import { CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider, commands, Disposable, languages, Position, Range, Selection, TextDocument, TextEditor, Uri, window, workspace } from "vscode";
import { DART_MODE, WRAP_SNIPPET_COMMAND } from "../constant/constant";
import { VSCODE_EXECUTE_CODE_ACTION_PROVIDER } from "../constant/vscode";
import { getExtensionSnippetPath } from "../util/util";

const leftBracket = '(';
const rightBracket = ')';
const snippetFilePath = '.vscode/wrap.code-snippets';

const wrapWidgetCodeActionKind = 'refactor.flutter.wrap.generic';
export class DatWrapCodeActionProvider implements CodeActionProvider {

  public disposables: Disposable[] = [];
  public commonSnippetList?: Snippet[];
  public customSnippetList?: Snippet[];

  constructor() {
    this.disposables.push(
      languages.registerCodeActionsProvider(DART_MODE, this),
      workspace.onDidSaveTextDocument((e) => this.listenCustomSnippetFile(e)),
    );
  }

  public async provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext): Promise<CodeAction[] | undefined> {
    if (context && context?.only?.value == wrapWidgetCodeActionKind) return;

    const editor = window.activeTextEditor;
    if (editor) {
      let widgetRange = ((await this.getWidgetRange(editor)) ?? this.tryGetTargetSelection(editor));
      if (widgetRange) {
        if (!this.commonSnippetList) {
          this.commonSnippetList = await this.getCommonSnippetList();
        }

        if (!this.customSnippetList) {
          this.customSnippetList = await this.getSnippetList();
        }

        return [...this.commonSnippetList, ...(this.customSnippetList ?? [])].map((snippet) => {
          let action = new CodeAction(`Wrap with 👉${snippet.name}👈`, CodeActionKind.Refactor);
          action.command = {
            title: snippet.name,
            command: WRAP_SNIPPET_COMMAND,
            arguments: [widgetRange, snippet.bodyText],
          };
          return action;
        });
      }
    }
  }

  private async getWidgetRange(editor: TextEditor): Promise<Range | undefined> {
    let codeActions = (await commands.executeCommand(VSCODE_EXECUTE_CODE_ACTION_PROVIDER, editor.document.uri, editor.selection, wrapWidgetCodeActionKind)) as CodeAction[];
    if (codeActions.length > 0) {
      return codeActions[0].command?.arguments?.[2]['range'];
    }
  }

  private tryGetTargetSelection(editor: TextEditor): Selection | undefined {
    const document = editor.document;
    let textRange = document.getWordRangeAtPosition(editor.selection.active, /(?<=\W+)(const )?[\w\.,<> ]*\(/);
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

  private async getCommonSnippetList(): Promise<Snippet[]> {
    return (await this.getSnippetList(getExtensionSnippetPath('wrap.json'))) ?? [];
  }

  private async getSnippetList(snippetFileUri?: Uri): Promise<Snippet[] | undefined> {
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

  private async listenCustomSnippetFile(textDocument: TextDocument): Promise<void> {
    if (textDocument.uri.path.endsWith(snippetFilePath)) {
      let snippetList = await this.getSnippetList(textDocument.uri);
      if (snippetList) {
        this.customSnippetList = snippetList;
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