import { commands, InputBoxOptions, ProgressLocation, SymbolInformation, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { JUMP_TO_EDITOR_COMMAND, SEARCH_SYMBOL_COMMAND } from "../constant/constant";
import { VSCODE_EXECUTE_WORKSPACE_SYMBOL_PROVIDER } from "../constant/vscode";
import { rangeIgnoreComment } from "../util/util";

export class SearchSymbolCommand extends DisposableBase {

  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand(SEARCH_SYMBOL_COMMAND, SearchSymbolCommand.searchSymbol, this),
    );
  }

  static async searchSymbol() {
    let input = await inputSearchSymbol();
    if (input) {
      const symbolList = await window.withProgress({
        location: ProgressLocation.Notification,
        title: `Search Symbol for ${input}`,
        cancellable: true,
      }, () => commands.executeCommand<Array<SymbolInformation>>(VSCODE_EXECUTE_WORKSPACE_SYMBOL_PROVIDER, input));

      if (symbolList) {
        let symbolLocation;
        let symbol = symbolList.find(symbol => symbol.name == input);
        if (symbol) {
          symbolLocation = symbol.location;
        } else {
          let items = symbolList.map((symbol) => ({
            label: symbol.name,
            description: symbol.containerName,
            detail: symbol.location.uri.path,
            location: symbol.location
          })).sort((a, b) => {
            let aIncludes = a.label.includes(input!);
            let bIncludes = b.label.includes(input!);

            if (aIncludes && bIncludes) return a.label.length > b.label.length ? 1 : -1;
            if (aIncludes || bIncludes) return bIncludes ? 1 : -1;

            return b.label.localeCompare(a.label);
          });

          let selected = await window.showQuickPick(
            items,
            {
              title: input,
              matchOnDescription: true,
              matchOnDetail: true,
              placeHolder: `Continue to search ${input} in result list`,
            }
          );

          if (selected) symbolLocation = selected.location
        }

        if (symbolLocation) {
          let targetRange = await rangeIgnoreComment(symbolLocation.uri, symbolLocation.range);
          let selectionRange = targetRange.isSingleLine ? targetRange : null;
          commands.executeCommand(JUMP_TO_EDITOR_COMMAND, symbolLocation.uri.path, targetRange, selectionRange);
        }
      }
    }
  }
}

function inputSearchSymbol(): Thenable<string | undefined> {
  const inputBoxOptions: InputBoxOptions = {
    prompt: 'Input Search Symbol',
    placeHolder: 'Dart Sharp',
  };
  return window.showInputBox(inputBoxOptions);
}