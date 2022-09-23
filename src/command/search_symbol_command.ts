import { commands, InputBoxOptions, SymbolInformation, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { SEARCH_SYMBOL_COMMAND } from "../constant/constant";
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
      const symbolList = await commands.executeCommand<Array<SymbolInformation>>(VSCODE_EXECUTE_WORKSPACE_SYMBOL_PROVIDER, input);

      if (symbolList) {
        let symbol = symbolList.find(symbol => symbol.name == input);
        console.log(symbol);

        let selected = await window.showQuickPick(symbolList.map((symbol) => ({
          label: symbol.name,
          description: symbol.containerName, 
          detail: symbol.location.uri.path,
        })));
        console.log(selected);
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