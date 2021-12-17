import { Range, TextDocument, window } from "vscode";

export function getRangeText(range: Range, document?:  TextDocument): string | undefined {
  document ??= window.activeTextEditor?.document;
  return document?.getText(range);
}