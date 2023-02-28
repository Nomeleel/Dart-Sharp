# Dart Sharp

Dart extension plus，在Dart插件的基础上扩展一些稀奇古怪的功能。 
预计是一些业务性的功能，如果有必要会计划将部分功能合入[Dart extension](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code)。

## 快捷键 --> 开启/关闭 格式化

快捷键: ***ctrl+tab***

![format](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/format.gif)

### 格式化状态在底部状态栏显示

![format_status_bar](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/format_status_bar.gif)

## 嵌套自定义Widget

使用**Refactor...**
![wrap](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/wrap.gif)

使用**Wrap With Widget** 或快捷键: ***ctrl+shift+w***
![wrap_with_widget_show_quick_pick](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/wrap_with_widget_show_quick_pick.gif)

自定义snippet文件目录: ***.vscode/wrap.code-snippets***
替换标识位: ***推荐使用后两种***(更符合[Snippet Syntax](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax))
  1. ***${WIDGET}***
  2. ***$0***
  3. ***${0:xxx}***

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
      "\tchild: $0,",
      ")"
    ],
    "description": "Add Padding..."
  }
}
```

***另外:*** 该文件中配置的snippet还可以在当前项目中，通过预设的prefix进行响应，一举两得。(这也是推荐使用后两种替换标识位的原因)

### 同时内置了一些比较通用的Widget可供嵌套使用

![wrap_common_snippet](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/wrap_common_snippet.png)

### 内置常用的Flutter Snippet

TextStyle、RichText、SizedBox.shrink、Color、BoxDecoration、ShapeDecoration...

## Pubspec视图

### pubspec文件导航

![pubspec_nav](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/pubspec_nav.gif)
### 批量操作

![pubspec](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/pubspec.gif)

## 资源文件高亮提示/导航/悬浮展示

![assets](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/assets.gif)

## 排水沟色块提醒增强

![color_decoration](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/color_decoration.png)

## 注释操作增强

### 案例代码突出显示、查看、快速复制

<img src="https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/commentary_example_code.gif" width="60%"/>

### 案例代码链接快速查看、导向

<img src="https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/commentary_example_link.gif" width="60%"/>

### 注释快速复制

快捷键: ***ctrl+shift+c***

![copy_commentary](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/copy_commentary.gif)

## 快速新建Dart文件

快捷键: ***ctrl+shift+d***

<div><img src="https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/new_dart_file_key.gif" width="50%"/><img src="https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/new_dart_file_editor_menu.gif" width="50%"/><img src="https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/new_dart_file_content_menu.gif" width="50%"/></div>

## 符号定义快速查询

快捷键: ***ctrl+shift+s***

<img src="https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/search_symbol.gif" width="70%"/>

## 符号关系查询

快捷键: ***ctrl+shift+r***

![symbol_relation](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/dart_sharp/symbol_relation.gif)
