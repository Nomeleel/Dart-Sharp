import { join } from "path";
import { commands, extensions, Position, Range, TextDocument, TextEdit, TextEditor, Uri, window, workspace, WorkspaceEdit } from "vscode";
import { EXTENSION_NAME, PUBLISHER } from "../constant/constant";

// TODO(Nomeleel): 分类
 
export async function openTextDocument(path: string): Promise<TextEditor> {
  let textDocument = await workspace.openTextDocument(path);
  return await window.showTextDocument(textDocument);
}

export function activePositionText(): string | undefined {
  if (window.activeTextEditor) {
    let textEditor = window.activeTextEditor;
    let document = textEditor.document;
    return document.getText(document.getWordRangeAtPosition(textEditor.selection.active));
  }
}

export async function dartFileEdit(textEdits: Array<TextEdit>, uri?: Uri) {
  uri = uri ? uri : window.activeTextEditor?.document.uri;
  if (uri) {
    let workspaceEdit = new WorkspaceEdit();
    workspaceEdit.set(uri, textEdits);
    await workspace.applyEdit(workspaceEdit);
    await workspace.saveAll();

    await dartOrganizeImports(uri);
  }
}

export async function dartOrganizeImports(uri?: Uri) {
  let textDocument = uri ? (await workspace.openTextDocument(uri)) : window.activeTextEditor?.document;
  await commands.executeCommand('_dart.organizeImports', textDocument);
}

export async function realLineCount(uri: Uri): Promise<number> {
  let textDocument = await workspace.openTextDocument(uri);
  let lineCount: number = textDocument.lineCount;
  while (textDocument.lineAt(lineCount - 1).isEmptyOrWhitespace) {
    lineCount--;
  }
  return lineCount;
}

export async function getFillRange(uri: Uri): Promise<Range> {
  let textDocument = await workspace.openTextDocument(uri);
  return new Range(new Position(0, 0), new Position(textDocument.lineCount + 1, 0));
}

export function rangesOfOne(textEditor: TextEditor, searchText: string): Range | undefined {
  const doc = textEditor.document;
  if (doc) {
    for (let index = 0; index < doc.lineCount; index++) {
      let findIndex = doc.lineAt(index).text.indexOf(searchText);
      if (findIndex !== -1) {
        return doc.getWordRangeAtPosition(new Position(index, findIndex + searchText.length), /([^\"]+)/g);
      }
    }
  }
}

export function getRange(document: TextDocument, offset: number, length: number): Range {
  return new Range(document.positionAt(offset), document.positionAt(offset + length));
}

export function isString(string: any): boolean {
  // return Object.prototype.toString.call(string) === '[object String]';
  return typeof (string) === 'string';
}

export function first(map: Map<any, any>): any | undefined {
  let first;
  map?.forEach((v, k) => {
    first = v;
    return;
  });
  return first;
}

export function getConfiguration<T>(key: string): T {
  return workspace.getConfiguration().get(key) as T;
}

export function setGlobalConfiguration<T>(key: string, value: T) {
  return workspace.getConfiguration().update(key, value, true);
}

export function getExtensionPath(): string {
  return extensions.getExtension(`${PUBLISHER}.${EXTENSION_NAME}`)!.extensionPath;
}

export function getExtensionIconPath(iconName?: string): Uri | undefined {
  if (!iconName) return undefined;
  return Uri.file(join(getExtensionPath(), 'resource', 'icon', iconName));
}

export function getExtensionSnippetPath(snippetName?: string): Uri | undefined {
  return Uri.file(join(getExtensionPath(), 'snippets', snippetName ?? ''));
}

export async function setContext(key: string, context: any): Promise<any> {
  return await commands.executeCommand("setContext", key, context);
}

// Copy from dart extension.
// https://github.com/Dart-Code/Dart-Code/blob/master/src/extension/analysis/analyzer_lsp_snippet_text_edits.ts#L73
export function compensateForVsCodeIndenting(newText: string, leadingIndentCharacters: number) {
  const indent = " ".repeat(leadingIndentCharacters);
  const indentPattern = new RegExp(`\n${indent}`, "g");
  return newText.replace(indentPattern, "\n");
}