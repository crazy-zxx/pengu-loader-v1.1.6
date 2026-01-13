# PenguLoader 英雄联盟 DIY 工具 & 插件集合

## 介绍

> 项目文件来自 [https://github.com/PenguLoader/PenguLoader](https://github.com/PenguLoader/PenguLoader) 的官方 [v1.1.6 版本](https://github.com/PenguLoader/PenguLoader/releases/download/v1.1.6/pengu-loader-v1.1.6.zip) ，做了一些配置，集成了几个有用的插件。

### config 文件

做了配置，保证插件能正常工作：

```plain
Language=中文
OptimizeClient=false
DisableWebSecurity=1
IgnoreCertificateErrors=1
```

作用如下：启用应用中文语言界面、禁用优化联盟客户端、禁用浏览器的同源策略、忽略 HTTPS 证书错误。


### plugins 目录

存放了一些好用的插件：

> ~~自动补充乱斗骰子插件： `auto-fill-dice.js` 来自 [Discord 论坛的 vatchingfun](https://discord.com/channels/1069483280438673418/1077886267464892468/threads/1365610922046918716) 。~~  游戏模式已经不存在！

> 自动接受对局插件：`autoaccept.js` 来自 [Discord 论坛的 ashera ](https://discord.com/channels/1069483280438673418/1077886267464892468/threads/1371799042832597054) ，重新调整了设置界面的显示位置，避免大乱斗模式的骰子显示遮挡；修改接受对局的延时为2秒，默认不隐藏找到对局时的接受窗口，给用户取消的机会。

> 屏蔽联盟比赛窗口插件：`Block_match_live.js` 来自 [Discord 论坛的 Pual](https://discord.com/channels/1069483280438673418/1077886267464892468/threads/1354072649306865695) 。

> 屏蔽联盟启动广告插件：`Fuck_LaunchAds.js` 来自 [Discord 论坛的 Pual](https://discord.com/channels/1069483280438673418/1077886267464892468/threads/1346419571028004966) 。


更多有意思的插件可以去 [Discord 论坛](https://discord.com/channels/1069483280438673418/1077886267464892468) 发现。


## 使用

直接下载该仓库的[压缩包](https://github.com/crazy-zxx/pengu-loader-v1.1.6/archive/refs/tags/v6.0.zip)，或者克隆代码到本地，执行目录中的 `Pengu Loader.exe` 文件即可。

