import { DisposableBase } from "../common/disposable_base";
import { ColorDecoration, ColorDecorationConfig, ColorRangeComputerARGBProvider } from 'color-decoration/dist';
import { getExtensionPath } from "../util/util";

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