import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Disposable, languages, Position, ProviderResult, TextDocument } from "vscode";
import { DART_MODE } from "../constant/constant";

const rightParentheses = ')';
const triggerCharacters = [rightParentheses];
const triggerCharactersRegExp = new RegExp(`[${triggerCharacters.join()}]`);
const comma = ',';

export class DartCodingStyleCompletionItemProvider implements CompletionItemProvider {

  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      languages.registerCompletionItemProvider(DART_MODE, this, ...triggerCharacters),
    );
  }

  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionList<CompletionItem> | CompletionItem[]> {
    let items: CompletionItem[] = [];
    let symbol = document.getText(document.getWordRangeAtPosition(position, triggerCharactersRegExp));
    if (symbol) {
      switch (symbol) {
        case rightParentheses:
          items.push(new CompletionItem(comma));
          break;
        default:
          break;
      }
    }
    return items;
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}
