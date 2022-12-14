
# 打开/关闭 格式化快捷键 或者屏蔽某些文件的自动格式化
  ## 计划方案1
  1. 主要靠切换Dart格式化配置的开关
  2. 文件添加启用/禁用格式化菜单，或者右上角添加action，并将禁用文件写到Setting
  3. 对切换文件进行监控，Setting存在该目录则禁用，反之打开

  ## 计划方案2
  1. 修改自动保存的回调，阻止Dart对其自动格式化
  2. 预计会改动Dart插件，或者重写自动保存Task

# 为代码中Assets路径提供跳转和光标浮动显示
  ## 计划方案1
  1. VSC 应该提供了相关方案，参照字符串中的url地址
 
  ## 计划方案2
  1. 采用正则去匹配
  2. 当作符号去匹配/或者引用
  3. 显示下划线或许只是样式是String.tmLanguage.json默认导致

  # 类名与文件名之间的相互转换
  ## 计划方案
  1. 快捷键命令（Shift取反）
  2. 正则或者字符数组操作

# 将选中的片段移动到新建Dart文件中
  ## 计划方案
  1. 符号可使用正则提取或借助Dart LSP
  2. 文件名采取上述命令
  3. 处理该符号所有引用和导出

# Wrap自定义Widget(同时导入对应的lib)

  1. 可以添加官方插件所没有支持的Widget
  2. 可在设置中添加可以Wrap的Widget代码
  3. 设置项支持导入导出功能方便分享

  # Pubspec.yaml 文件统一管理

  1. 对所有pubspec.yaml执行pub get
  2. 对其中pubspec.yaml的修改，所有引用当前package的执行pub get
  3. 是否有必要写一个View

# 注释体验增强
 
  1. 符号命中跳转(关注[]中的符号)
  2. Example代码提供复制功能(提取```dart```中内容)
  3.   /// ** See code in examples/api/lib/material/reorderable_list/reorderable_list_view.reorderable_list_view_builder.0.dart **

# pubspec.lock ref upgrade
 
  1. 有可能变的分支 pub get时需要更新commit hash