# CET-6 Recorder (Web App)

Github Pages：https://vasantlong.github.io/cet6-recorder/

一款优雅的单页应用程序(SPA)，专为帮助学生准备**大学英语六级考试(CET-6)**而设计。它提供严格的评分算法、细致的时间跟踪和深入的性能分析。

## 🚀 主要功能

- **智能评分引擎**：根据官方 CET-6 加权逻辑自动计算分数：
  - **听力 (35%)**：支持长对话、短文和讲座的细化评分。
  - **阅读 (35%)**：专用输入框支持选词填空、匹配题和仔细阅读题。
  - **写作与翻译 (各 15%)**：标准分转换（例如，输入 12/15 -> 转换后分数）。
- **精细化练习跟踪**：
  - 可跟踪完整模拟考试或特定练习（例如，"仅做阅读第一篇"）。
  - **章节计时器**：记录特定章节的时间（例如，仔细阅读 15 分钟），自动同步到成绩录入表。
  - **尝试跟踪**：区分"跳过"章节和"失败"(0 分)章节，确保平均分计算准确。
- **可视化分析**：
  - **仪表板**：查看总练习次数、最高分和标准化平均分。
  - **专项表现**：查看你在细分领域中的具体优势（例如，匹配题 vs. 完形填空）。
  - **趋势图表**：双轴图表可视化展示随时间变化的分数与用时关系。
- **数据管理**：
  - 使用 Supabase 进行**云端存储**（需要配置）。
  - 将历史记录导出为**CSV 格式**用于 Excel 分析。
  - 数据隐私保护（支持端到端加密选项）。

## 🛠 技术栈

- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **图表**：Recharts
- **身份验证**：Supabase Auth
- **数据库**：带行级安全的 Supabase PostgreSQL
- **图标/字体**：Inter 字体

## 📦 安装与设置

1. **克隆仓库**：

   ```bash
   git clone https://github.com/VasantLong/cet6-recorder.git
   cd cet6-recorder
   ```

2. **安装依赖**:

   ```bash
   npm install
   ```

3. **配置Supabase（可选但推荐）**：

   - 在[https://supabase.com](https://supabase.com/)注册一个Supabase账户。

   - 创建一个新项目。

   - 在项目仪表板中，复制你的**Project URL**和**Anon Key**。

   - 在项目根目录下创建`.env`文件。

   - 添加以下行（使用`VITE_`前缀）：

     ```
     VITE_SUPABASE_URL=your-project-url-here
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

   - 将`your-project-url-here`和`your-anon-key-here`替换为你的实际Supabase项目URL和Anon Key。

4. **运行开发服务器**：

   ```bash
   npm run dev
   ```

   在浏览器中打开 [http://localhost:5173](http://localhost:5173/)

5. **构建生产版本**：

   ```bash
   npm run build
   ```

## 🚢 部署 (GitHub Pages)

本项目已配置为可轻松部署到GitHub Pages。

1. 更新vite.config.ts：

   ```typescript
   export default defineConfig({
     base: "/cet6-recorder/", // 替换为你的仓库名称
     plugins: [react()],
   });
   ```

2. 运行部署脚本：

   ```bash
   npm run deploy
   ```

## 🧩 使用指南

### 练习模式

1. **计时器**：选择目标章节（例如，"阅读 - 仔细阅读1"）并启动计时器。完成后，点击**"记录并重置"**将时间发送到表单。
2. **成绩录入**：
   - 切换章节旁边的**圆圈按钮**将其标记为"已尝试"。
   - 输入正确答案数（或写作/翻译的标准分）。
   - **验证**：活动章节必须有有效时间（听力除外）。零分需要确认。
3. **保存**：点击"保存记录"计算总分并保存到历史记录。

### 统计模式

1. **仪表板**：查看标准化平均值。例如，如果你只做了1篇阅读文章，分数会被缩放以代表完整章节的等效值，从而实现准确的平均计算。
2. **图表**：使用下拉菜单切换指标（例如，仅查看"写作"趋势）。
3. **管理**：将数据导出为CSV或清除历史记录。

### 深色模式

应用程序支持深色模式，可以通过顶部导航栏的月亮/太阳图标切换。主题偏好设置保存在本地存储中，在会话间持久化。

## ☁️ 云同步

应用程序通过Supabase支持云同步。要启用此功能：

1. 在[https://supabase.io](https://supabase.io/)创建一个Supabase项目
2. 根据项目要求设置身份验证和数据库表
3. 将你的Supabase凭证添加到`.env`文件中
4. 登录应用程序开始同步数据

## 🤝 贡献

欢迎贡献！请fork仓库并提交pull request。

## 📄 许可证

详见[LICENSE](LICENSE)文件。

## 待办事项

- [x] 用户交互后清除警报消息。==v1.1.0==

- [ ] 改进UI/UX以获得更好的用户体验。

- [x] 添加深色模式支持。==v1.2.0==

- [ ] 优化移动设备性能。

- [x] 实现云存储选项的用户身份验证。==v2.0.0==

- [ ] 集成第三方API以获取额外资源。

- [ ] 添加导出为CSV功能。
