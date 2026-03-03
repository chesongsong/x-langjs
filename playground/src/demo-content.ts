export const STATIC_CODE = `# X-Lang 组件一览

本页面展示所有可用的 x-lang 渲染组件，每种组件提供多种用法示例。


### 赋值运算符与比较/逻辑

\`\`\`x-lang
计数 = 1
计数 += 2
计数 *= 3
满足条件 = (计数 >= 9) && (计数 != 10)
\`\`\`

### 函数 / 控制流 / return

\`\`\`x-lang
求和(起始: number, 结束: number) {
  合计 = 0
  for (i = 起始; i <= 结束; i += 1) {
    合计 += i
  }
  return 合计;
}
\`\`\`

### 数组 / 对象 / typeof

\`\`\`x-lang
数组 = [1, 2, 3, 4]
对象 = { 名称: "计算器", 版本: 1 }
第三项 = 数组[2]
类型名 = typeof 对象.版本
\`\`\`





## 1. 语法与计算 Demo

\`\`\`x-lang
基础运算 = 8 + 4 * 2 - 3
整除余数 = 17 % 5
对比结果 = (基础运算 > 10) && (整除余数 == 2)
\`\`\`

\`\`\`x-lang
文本 = "Hello"
拼接 = 文本 + " x-lang"
\`\`\`

\`\`\`x-lang
数组 = [1, 2, 3, 4]
对象 = { 名称: "计算器", 版本: 1 }
数组[2] + 对象.版本
\`\`\`

\`\`\`x-lang
税率 = 0.06
计算税 = fn(金额) => 金额 * 税率
计算税(200)
\`\`\`

\`\`\`x-lang
日期 = 当前时间
日期字符串 = "当前时间: " + 日期
时间戳 = 日期 + 0
descriptions({ 日期字符串: 日期字符串, 时间戳: 时间戳 })
\`\`\`

\`\`\`x-lang
分数 = 86
评价 = ""
if (分数 >= 90) { 评价 = "优秀"; }
else if (分数 >= 60) { 评价 = "及格"; }
else { 评价 = "不及格"; }
\`\`\`

\`\`\`x-lang
总和 = 0
for (i = 1; i <= 5; i += 1) {
  总和 += i
}
\`\`\`

\`\`\`x-lang
计数 = 0
累加 = 0
while (true) {
  计数 += 1
  if (计数 == 2) { continue; }
  if (计数 > 4) { break; }
  累加 += 计数
}
\`\`\`

\`\`\`x-lang
求和(起始, 结束) {
  合计 = 0
  for (i = 起始; i <= 结束; i += 1) {
    合计 += i
  }
  return 合计
}
求和(1, 10)
\`\`\`





## 2. Alert 提示

\`\`\`x-lang
alert(title = "欢迎", description = "支持标题与描述，type 为 info。", type = "info")
\`\`\`

\`\`\`x-lang
alert(title = "操作成功", type = "success")
\`\`\`

\`\`\`x-lang
alert(title = "注意", description = "某些配置可能影响性能。", type = "warning")
\`\`\`

\`\`\`x-lang
alert(title = "请求失败", description = "请检查网络后重试。", type = "error")
\`\`\`





## 3. Statistic 统计数值

\`\`\`x-lang
statistic("员工总数", 4)
\`\`\`

\`\`\`x-lang
statistic(title = "平均薪资", value = 26250, suffix = "元")
\`\`\`

\`\`\`x-lang
statistic(title = "年度营收", value = 1200000, prefix = "¥", suffix = "")
\`\`\`

\`\`\`x-lang
statistic("项目完成度", 100)
\`\`\`





## 4. Progress 进度条

\`\`\`x-lang
项目进度 = 78
progress(项目进度, status = "success")
\`\`\`

\`\`\`x-lang
完成度 = 65
progress(完成度, status = "warning")
\`\`\`

\`\`\`x-lang
progress(65, status = "exception")
\`\`\`

\`\`\`x-lang
progress(100)
\`\`\`





## 5. Tag 标签

\`\`\`x-lang
tag("工程部", "设计部", "产品部", type = "primary")
\`\`\`

\`\`\`x-lang
tag("已完成", "已通过", type = "success")
\`\`\`

\`\`\`x-lang
tag("待审核", "处理中", type = "warning")
\`\`\`

\`\`\`x-lang
tag("已拒绝", "已取消", type = "danger")
\`\`\`

\`\`\`x-lang
tag("标签一", "标签二", "标签三", type = "info")
\`\`\`





## 6. Rate 评分

\`\`\`x-lang
团队评分 = 4.5
rate(团队评分)
\`\`\`

\`\`\`x-lang
满意度 = 4.8
rate(满意度)
\`\`\`

\`\`\`x-lang
rate(4)
\`\`\`





## 7. Descriptions 描述列表

\`\`\`x-lang
公司信息 = { 名称: "X-Lang 科技", 行业: "软件开发", 成立年份: 2024, 地址: "上海市浦东新区" }
descriptions(公司信息)
\`\`\`

\`\`\`x-lang
公司信息 = { 名称: "X-Lang 科技", 行业: "软件开发", 成立年份: 2024, 地址: "上海市浦东新区" }
descriptions(公司信息, column = 1)
\`\`\`





## 8. Table 表格

\`\`\`x-lang
用户列表 = [{ 姓名: "张三", 部门: "工程部", 薪资: 25000 }, { 姓名: "李四", 部门: "设计部", 薪资: 22000 }, { 姓名: "王五", 部门: "产品部", 薪资: 28000 }, { 姓名: "赵六", 部门: "工程部", 薪资: 30000 }]
table(用户列表)
\`\`\`

\`\`\`x-lang
用户列表 = [{ 姓名: "张三", 部门: "工程部", 薪资: 25000 }, { 姓名: "李四", 部门: "设计部", 薪资: 22000 }, { 姓名: "王五", 部门: "产品部", 薪资: 28000 }, { 姓名: "赵六", 部门: "工程部", 薪资: 30000 }]
table(用户列表, 姓名, 部门, 薪资)
\`\`\`





## 9. Button 按钮

\`\`\`x-lang
button(text = "主要按钮", type = "primary")
\`\`\`

\`\`\`x-lang
button(text = "成功按钮", type = "success")
\`\`\`

\`\`\`x-lang
button(text = "警告按钮", type = "warning")
\`\`\`

\`\`\`x-lang
button(text = "危险按钮", type = "danger")
\`\`\`

\`\`\`x-lang
button(text = "小号按钮", type = "primary", size = "small")
\`\`\`

\`\`\`x-lang
button(text = "大号按钮", type = "default", size = "large")
\`\`\`

\`\`\`x-lang
button(text = "点我提示", onClick = "操作成功！")
\`\`\`





## 10. Card 卡片

\`\`\`x-lang
card(title = "项目概要", content = "本季度共完成 3 个里程碑，团队整体表现优异。")
\`\`\`

\`\`\`x-lang
card(title = "无阴影", content = "shadow = never 时卡片无阴影。", shadow = "never")
\`\`\`

\`\`\`x-lang
card(title = "常显阴影", content = "shadow = always 时阴影始终显示。", shadow = "always")
\`\`\`

\`\`\`x-lang
card("仅内容", "不传 title 时只显示内容区域。")
\`\`\`





## 11. ordercard 订单详情卡

\`\`\`x-lang
订单 = { 订单号: "O202402280001", 状态: "已支付", 金额: 299, 下单时间: "2026-02-28 14:30", 商品列表: [{ 商品名: "X-Lang 入门教程", 数量: 1, 单价: 99 }, { 商品名: "组件开发实战", 数量: 2, 单价: 100 }], 收货地址: "上海市浦东新区张江镇 XX 路 100 号" }
ordercard(订单)
\`\`\`

\`\`\`x-lang
订单2 = { 订单号: "O202402280002", 状态: "待发货", 金额: 158, 下单时间: "2026-02-27 09:15", 商品列表: [{ 商品名: "实战手册", 数量: 1, 单价: 158 }], 收货地址: "北京市海淀区中关村大街 1 号" }
ordercard(订单2)
\`\`\`

\`\`\`x-lang
ordercard(订单号 = "O2024000001", 状态 = "已完成", 金额 = 88, 下单时间 = "2026-01-01 12:00", 收货地址 = "示例地址")
\`\`\`





## 12. 酒店变更确认卡

\`\`\`x-lang
hotelconfirm(
  hotelName = "测试酒店123456",
  roomItems = ["家庭房", "家庭房-双早"],
  dateValue = "2026年2月12日",
  actionItems = ["房态：打开", "添加保留房：统一设置为 2 间", "保留房售完后：直接关房"],
  tip = "以上修改内容确认无误后可点击 确认提交按钮",
  buttonText = "确认提交"
)
\`\`\`





## 13. Form 表单

\`\`\`x-lang
表单字段 = [
  { label: "项目名称", prop: "name", type: "text", placeholder: "例如：北极星计划", required: true, span: 12 },
  { label: "负责人", prop: "owner", type: "select", options: ["张三", "李四", "王五"], required: true, span: 12 },
  { label: "开始日期", prop: "startDate", type: "date", required: true, span: 12 },
  { label: "结束日期", prop: "endDate", type: "date", span: 12 },
  { label: "预算(万元)", prop: "budget", type: "number", span: 12 },
  { label: "优先级", prop: "priority", type: "radio", options: ["高", "中", "低"], span: 12 },
  { label: "协作部门", prop: "dept", type: "checkbox", options: ["产品", "设计", "研发", "市场"], span: 24 },
  { label: "是否需要审核", prop: "needReview", type: "switch", span: 12 },
  { label: "风险等级", prop: "risk", type: "select", options: ["低", "中", "高"], span: 12 },
  { label: "项目说明", prop: "desc", type: "textarea", rows: 4, placeholder: "填写项目目标、范围与交付内容", span: 24 }
]
form(
  title = "项目立项表单",
  description = "包含文本、选择、日期、数值、单选、复选、开关与多行文本。",
  fields = 表单字段,
  submitText = "提交立项",
  resetText = "重置表单",
  column = 2
)
\`\`\`





## 14. Result 结果页

\`\`\`x-lang
result(title = "页面加载完成", subtitle = "所有组件已渲染成功。", type = "success")
\`\`\`

\`\`\`x-lang
result(title = "暂无数据", subtitle = "请先导入或创建数据。", type = "info")
\`\`\`

\`\`\`x-lang
result(title = "操作失败", subtitle = "请稍后重试或联系管理员。", type = "error")
\`\`\`

\`\`\`x-lang
result(title = "请确认", subtitle = "当前操作可能产生风险。", type = "warning")
\`\`\`





## 15. Drawer 抽屉

\`\`\`x-lang
drawer(title = "筛选面板", content = "可在抽屉内放置筛选条件或表单内容。", placement = "right", size = "320px")
\`\`\`





## 16. Timeline 时间线

\`\`\`x-lang
里程碑 = [
  { 标题: "需求评审", 时间: "2026-01-08", 类型: "info" },
  { 标题: "开发完成", 时间: "2026-02-02", 类型: "success" },
  { 标题: "上线发布", 时间: "2026-02-20", 类型: "primary" }
]
timeline(里程碑)
\`\`\`





## 17. Collapse 折叠面板

\`\`\`x-lang
问答 = [
  { 标题: "支持哪些组件？", 内容: "目前支持基础展示与交互组件。" },
  { 标题: "是否支持流式？", 内容: "支持流式渲染与骨架屏占位。" },
  { 标题: "如何切换 UI 库？", 内容: "顶部按钮可切换 Element/Arco/Antd。" }
]
collapse(问答)
\`\`\`





## 18. Dialog 对话框

\`\`\`x-lang
dialog(title = "确认操作", content = "请确认是否继续执行当前操作。")
\`\`\`





## 19. Charts 图表（支持自定义 option）

\`\`\`x-lang
linechart(option = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" },
  series: [{ type: "line", data: [150, 230, 224, 218, 135, 147, 260] }]
})
\`\`\`

\`\`\`x-lang
areachart(option = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", boundaryGap: false, data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" },
  series: [{ type: "line", areaStyle: {}, data: [120, 132, 101, 134, 90, 230, 210] }]
})
\`\`\`

\`\`\`x-lang
barchart(option = {
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  xAxis: [{ type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], axisTick: { alignWithLabel: true } }],
  yAxis: [{ type: "value" }],
  series: [{ name: "Direct", type: "bar", barWidth: "60%", data: [10, 52, 200, 334, 390, 330, 220] }]
})
\`\`\`

\`\`\`x-lang
piechart(option = {
  tooltip: { trigger: "item" },
  series: [{
    type: "pie",
    radius: "60%",
    data: [
      { value: 1048, name: "Search" },
      { value: 735, name: "Direct" },
      { value: 580, name: "Email" },
      { value: 484, name: "Union Ads" },
      { value: 300, name: "Video Ads" }
    ]
  }]
})
\`\`\`

\`\`\`x-lang
scatterchart(option = {
  xAxis: { type: "value" },
  yAxis: { type: "value" },
  series: [{ type: "scatter", data: [[10, 8], [18, 15], [25, 5], [32, 28], [40, 12]] }]
})
\`\`\`

\`\`\`x-lang
candlestickchart(option = {
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  yAxis: { type: "value" },
  series: [{ type: "candlestick", data: [[20, 34, 10, 38], [40, 35, 30, 50], [31, 38, 33, 44], [38, 15, 5, 42], [30, 25, 20, 35]] }]
})
\`\`\`

\`\`\`x-lang
radarchart(option = {
  tooltip: {},
  radar: {
    indicator: [
      { name: "Sales", max: 6500 },
      { name: "Admin", max: 16000 },
      { name: "IT", max: 30000 },
      { name: "Support", max: 38000 },
      { name: "Dev", max: 52000 },
      { name: "Marketing", max: 25000 }
    ]
  },
  series: [{ type: "radar", data: [{ value: [4200, 3000, 20000, 35000, 50000, 18000], name: "预算" }] }]
})
\`\`\`

\`\`\`x-lang
graphchart(option = {
  tooltip: {},
  series: [{
    type: "graph",
    layout: "force",
    data: [{ name: "主节点" }, { name: "节点 A" }, { name: "节点 B" }, { name: "节点 C" }],
    links: [
      { source: "主节点", target: "节点 A" },
      { source: "主节点", target: "节点 B" },
      { source: "主节点", target: "节点 C" }
    ]
  }]
})
\`\`\`





## 小结

以上覆盖了 **alert、statistic、progress、tag、rate、descriptions、table、button、card、ordercard、hotelconfirm、form、result、drawer、timeline、collapse、dialog、linechart、areachart、barchart、piechart、scatterchart、candlestickchart、radarchart、graphchart** 共 25 类组件，可切换顶部组件库查看不同 UI 风格。
`

export const STREAM_CONTENT = STATIC_CODE;
