# Dart Sharp

Dart extension plus, 在Dart插件的基础上扩展一些稀奇古怪的功能。
预计是一些业务性的功能，如果有必要会计划将部分功能合入Dart extension。

## 快捷键 --> 开启/关闭 格式化

快捷键: ***ctrl+tab***

![format](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/format.gif)

## 嵌套自定义Widget

![wrap](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/wrap.gif)

自定义snippet文件目录: ***.vscode/wrap.code-snippets***
替换标识位: ***${WIDGET}***
试例: ***Padding***
```json
{
  "Padding": {
    "prefix": [
      "Padding",
      "padding"
    ],
    "scope": "dart",
    "body": [
      "Padding(",
      "\tpadding: const EdgeInsets.only(",
      "\t\ttop: ${1:0.0},",
      "\t\tbottom: ${2:0.0},",
      "\t\tleft: ${3:0.0},",
      "\t\tright: ${4:0.0},",
      "\t),",
      "\tchild: ${WIDGET},",
      ")"
    ],
    "description": "Add Padding..."
  }
}
```

***另外:*** 该文件中配置的snippet还可以在当前项目中，通过预设的prefix进行响应，一举两得。

## Pubspec视图

### pubspec文件导航

![pubspec_nav](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/pubspec_nav.gif)
### 批量操作

![pubspec](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/pubspec.gif)

## 资源文件高亮提示/导航/悬浮展示

![assets](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/assets.gif)

## 排水沟色块提醒增强

![color_decoration](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/color_decoration.png)