# TTSQ Android App

TTSQ 社区平台（[qiuht.cn](https://qiuht.cn)）的官方安卓客户端，基于 **Expo + React Native + TypeScript** 构建。与 Web 版共享同一套 Cloudflare Workers + D1 后端 API。

## ✨ 功能

与 Web 版功能对齐，包含 27 个页面：

- 🔐 账号注册 / 登录（含人机验证）
- 🏠 社区首页仪表盘
- 💬 公开聊天室 / 私信 / 群聊（含 Turkey AI 机器人）
- 📝 贴文发布、评论、点赞、分享
- 🧩 每日脑力王 BrainKing（可排名原创小游戏）
- 🎵 音乐分享
- 🖼️ 社区相册 / 生物图鉴
- 💡 问答提问板
- 🎂 社区生日墙
- 😊 心情签到 / 每日签到月历
- 🗳️ 投票、活动、链接、笔记
- 👤 个人主页、资料编辑、后台管理

## 🛠️ 技术栈

- Expo SDK 51 / React Native 0.74
- React Navigation（底部标签 + 原生栈）
- TypeScript
- AsyncStorage 本地持久化
- 后端：Cloudflare Workers + D1（`ttsq-api.qiutiantian102.workers.dev`，默认走代理 `proxy.qiuht.cn`）

## 🚀 开发

```bash
npm install
npm start          # 启动 Expo 开发服务器
npm run android    # 运行到安卓设备/模拟器
npm run typecheck  # TypeScript 类型检查
```

## 📦 打包（EAS Build）

```bash
# 预览版 APK
eas build -p android --profile preview

# 生产版 AAB（上架 Google Play）
eas build -p android --profile production
```

- 应用包名：`cn.qiuht.ttsq`
- 版本：见 `app.json` 的 `expo.version`

## 📁 目录结构

```
android-app/
├── App.tsx                 # 应用入口
├── app.json                # Expo 配置
├── eas.json                # EAS Build 配置
├── assets/                 # 图标 / 启动图
└── src/
    ├── auth/               # 认证上下文
    ├── components/         # 通用组件（Toast / UI）
    ├── navigation/         # 导航
    ├── screens/            # 27 个业务页面
    ├── shared/             # API 封装 / 类型定义
    └── theme.ts            # 主题
```

## 📄 许可

个人项目，版权归 [qiuht.cn](https://qiuht.cn) 所有。
