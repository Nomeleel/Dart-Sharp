import { ColorRangeComputerProvider } from "./color_range_computer_provider";

export class ColorDecorationConfig {
  constructor(
    readonly analyzableLanguages: Array<String>, 
    readonly analyzableFileExtensions: Array<String>,
    readonly colorRangeComputerProvider: ColorRangeComputerProvider,
  ){};
}
