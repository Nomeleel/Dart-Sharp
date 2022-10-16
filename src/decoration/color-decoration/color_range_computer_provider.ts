export interface ColorRangeComputerProvider {

  readonly colorPatterns: Array<String>;

  resolve(groups: { [key: string]: string }): string | undefined;
}

export class ColorRangeComputerARGBProvider implements ColorRangeComputerProvider {

  readonly colorPatterns = ['(?<argb>[A-Fa-f0-9]{8})(?=[,\\)\\]\\}\\\s])'];

  resolve(groups: { [key: string]: string; }): string | undefined {
    if (groups.argb) { return groups.argb.toLowerCase(); }
  }

}