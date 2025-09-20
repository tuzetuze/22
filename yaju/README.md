# 🏠 全屋辅助装修小程序

一个基于微信小程序和云开发的装修规划工具，帮助用户从零开始进行全屋装修规划。通过按空间分类的模块化设计，为用户提供系统性的装修指导，涵盖从需求分析到预算管理的完整装修前期规划流程。

[![Powered by CloudBase](https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg)](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)  

> 本项目基于 [**CloudBase AI ToolKit**](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) 开发，通过AI提示词和 MCP 协议+云开发，让开发更智能、更高效，支持AI生成全栈代码、一键部署至腾讯云开发（免服务器）、智能日志修复。

## ✨ 项目特点

- 🏠 **空间模块化规划** - 按客厅、卧室、厨房等空间分类管理
- 📋 **从零开始指导** - 需求分析→风格设计→物品清单的完整流程  
- 💰 **预算智能管理** - 分空间预算追踪和超支预警
- 🎨 **风格协调统一** - 整体风格与各空间风格关联检查
- 🎛️ **3D效果展示** - 简单的2.5D房间布局和家具摆放预览
- 📱 **用户友好体验** - 新手引导和装修知识贴士
- ☁️ **云端数据同步** - 项目数据自动保存和跨设备同步

## 🏗️ 项目架构

### 核心功能模块

#### 1. 空间管理系统
- **空间分类**: 客厅、餐厅、主卧、次卧、厨房、卫生间、书房、玄关、阳台
- **状态跟踪**: 未开始、规划中、已完成三种状态
- **进度可视化**: 实时显示各空间完成度

#### 2. 规划引擎
- **需求分析**: 面积测量、功能需求问卷、特殊要求收集
- **风格设计**: 装修风格选择、颜色搭配建议、整体协调检查
- **物品清单**: 必需品和可选品分类、价格估算、预算计算

#### 3. 预算管理
- **总预算设置**: 装修总预算上限设定
- **分空间追踪**: 各空间预算使用情况
- **预警系统**: 超支预警和合理性建议
- **可视化报表**: 预算分配饼图和趋势分析

### 小程序页面结构
```
miniprogram/
├── pages/
│   ├── index/          # 首页 - 项目概览和快速入口
│   ├── spaces/         # 空间列表 - 空间分类展示和管理
│   ├── space-plan/     # 空间规划 - 单个空间详细规划
│   ├── budget/         # 预算管理 - 预算统计和分析  
│   ├── preview/        # 整体预览 - 完整方案展示
│   └── profile/        # 个人中心 - 用户设置和项目管理
├── components/
│   ├── cloudbase-badge/  # CloudBase 徽章组件
│   └── room-3d/         # 3D房间展示组件
└── app.js              # 全局数据和配置
```

### 数据模型设计
```javascript
// 装修项目数据结构
decorationProject: {
  id: "项目ID",
  name: "项目名称", 
  totalBudget: "总预算",
  usedBudget: "已用预算",
  mainStyle: "主题风格",
  spaces: {
    // 各空间规划数据
    "living_room": {
      area: "面积",
      functions: ["功能需求"],
      style: "空间风格", 
      mainColor: "主色调",
      items: ["物品清单"],
      budget: "空间预算",
      isCompleted: "是否完成",
      hasStarted: "是否开始"
    }
  }
}
```

## 开始使用

### 前提条件
- 安装小程序开发工具。
- 拥有腾讯云开发账号。

### 安装依赖
云函数依赖已在 `cloudfunctions/getOpenId/package.json` 中定义，可在云开发控制台中安装依赖。

### 配置云开发环境
在小程序开发工具中，打开 `miniprogram/app.js` 文件里修改环境 ID，找到如下代码部分：
```javascript
wx.cloud.init({
  env: 'your-env-id', // 替换为你的云开发环境 ID  
  traceUser: true,
});
```
将 `your-env-id` 替换为你实际的云开发环境 ID。

### 本地开发
1. 打开小程序开发工具，导入本项目。
2. 上传并部署 `getOpenId` 云函数。
3. 点击开发工具中的预览按钮，查看效果。

## 目录结构
```
├── cloudfunctions/
│   └── getOpenId/
│       ├── index.js
│       └── package.json
├── miniprogram/
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── components/
│   │   └── cloudbase-badge/      # CloudBase徽章组件
│   │       ├── index.js
│   │       ├── index.json
│   │       ├── index.wxml
│   │       └── index.wxss
│   ├── images/
│   │   └── powered-by-cloudbase-badge.svg  # CloudBase徽章图标
│   ├── pages/
│   │   └── index/
│   │       ├── index.js
│   │       ├── index.json
│   │       ├── index.wxml
│   │       └── index.wxss
│   └── sitemap.json
├── project.config.json
└── project.private.config.json
```

## 云开发使用示例

通过 `wx.cloud` 访问云开发服务：

```javascript
// 数据库操作
const db = wx.cloud.database();
const result = await db.collection('users').get(); // 查询数据
await db.collection('users').add({ data: { name: 'test' } }); // 添加数据

// 调用云函数
const funcResult = await wx.cloud.callFunction({ name: 'getOpenId' });

// 文件上传
const uploadResult = await wx.cloud.uploadFile({ cloudPath: 'test.jpg', filePath: tempFilePath });
// 调用数据模型
const models = wx.cloud.models;
```

## 扩展开发
您可以根据项目需求，添加新的云函数和页面，实现更多的云开发功能。