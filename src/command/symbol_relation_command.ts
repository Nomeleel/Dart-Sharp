import { commands, DefinitionLink, Location, Position, Uri, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { SYMBOL_RELATION_COMMAND } from "../constant/constant";
import { VSCODE_EXECUTE_REFERENCE_PROVIDER } from "../constant/vscode";
import { getTextFromLocation, getTextFromPosition } from "../util/util";

export class SymbolRelationCommand extends DisposableBase {

  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand(SYMBOL_RELATION_COMMAND, SymbolRelationCommand.searchSymbol, this),
    );
  }

  static async searchSymbol(uri: Uri, position: Position) {
    let curUri = uri ?? window.activeTextEditor?.document.uri;
    let curPosition = position ?? window.activeTextEditor?.selection.start;
    console.log(await getTextFromPosition(curUri, curPosition));
    let locations = await commands.executeCommand<Array<Location>>(VSCODE_EXECUTE_REFERENCE_PROVIDER, curUri, curPosition);
    console.log(locations);
    if (locations) {
      let extend = locations.find(async (location) => {
        let text = await getTextFromLocation(location);
        console.log(text);
        return text.includes('extends');
      });

      console.log(extend);
    }
  }
}
