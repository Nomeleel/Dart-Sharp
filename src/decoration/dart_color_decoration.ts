import { DisposableBase } from "../common/disposable_base";
import { getExtensionPath } from "../util/util";
import { ColorDecoration, ColorDecorationConfig, ColorRangeComputerARGBProvider} from "./color-decoration/index";

export class DartColorDecoration extends DisposableBase  {

	constructor() {
    super();
		this.disposables.push(
			new ColorDecoration(
        getExtensionPath(),
        new ColorDecorationConfig(
          ['dart'], 
          ['dart'],
          new ColorRangeComputerARGBProvider()
        )
      ),
		);
  }
}