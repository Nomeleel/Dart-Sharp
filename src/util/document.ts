import { Position, Range, TextDocument, TextEditor, Uri, window, workspace } from "vscode";

export async function openTextDocument(path: string | Uri): Promise<TextEditor> {
  let textDocument = typeof(path) === 'string' ? await workspace.openTextDocument(path) : await workspace.openTextDocument(path);
  return window.showTextDocument(textDocument);
}

export function getRangeText(range?: Range, document?: TextDocument): string | undefined {
  if (!document) document = window.activeTextEditor?.document;
  return document?.getText(range ?? window.activeTextEditor?.selection);
}

export async function getTextFromPosition(uri: Uri, position: Position): Promise<string> {
  let textDocument = await workspace.openTextDocument(uri);
  return textDocument.getText(textDocument.getWordRangeAtPosition(position));
}

export async function getTextRangeFromPosition(uri: Uri, position: Position): Promise<Range> {
  let textDocument = await workspace.openTextDocument(uri);
  return textDocument.getWordRangeAtPosition(position) ?? new Range(position, position);
}

export function activeSelectionText(): string | undefined {
  return window.activeTextEditor?.document.getText(window.activeTextEditor?.selection);
}