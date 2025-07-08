## 架构说明

* `./app/layout.tsx` 共享布局（如导航栏、页脚）
* `./app/page.tsx` 初始页面的UI

## 使用文档
`.next`目录是根据`./pages/api`目录的内容生成的，可以使用下面代码重新生成

```
rm -rf .next
npm run build
```

先运行 `go_backend` 的后端 `./ai-interviewer` 启动后端服务

然后使用 `npm run dev` 开始调试模式。

在`./page/demo.tsx` 文件下 `synthesizeSpeech` 函数发送报文 `debug=true` 只会返回固定的音频，改为 `debug=false` 才会生成指定音频。
