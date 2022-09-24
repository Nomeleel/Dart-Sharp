import { commands, InputBoxOptions, ProgressLocation, SymbolInformation, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { JUMP_TO_EDITOR_COMMAND, SEARCH_SYMBOL_COMMAND } from "../constant/constant";
import { VSCODE_EXECUTE_WORKSPACE_SYMBOL_PROVIDER } from "../constant/vscode";

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
        title: 'Search Symbol',
        cancellable: true,
      }, () => commands.executeCommand<Array<SymbolInformation>>(VSCODE_EXECUTE_WORKSPACE_SYMBOL_PROVIDER, input));

      if (symbolList) {
        let symbolLocation;
        let symbol = symbolList.find(symbol => symbol.name == input);
        if (symbol) {
          symbolLocation = symbol.location;
        } else {
          let selected = await window.showQuickPick(symbolList.map((symbol) => ({
            label: symbol.name,
            description: symbol.containerName,
            detail: symbol.location.uri.path,
            location: symbol.location,
          })));
          if (selected) symbolLocation = selected.location
        }

        if (symbolLocation) commands.executeCommand(JUMP_TO_EDITOR_COMMAND, symbolLocation.uri.path, symbolLocation.range); // TODO: range 不大的话 selected
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