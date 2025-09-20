// 测试预算设置功能
// 在微信开发者工具控制台运行以下代码进行测试

// 1. 测试全局数据结构
console.log('全局数据:', getApp().globalData)

// 2. 测试预算设置
function testBudget() {
  const app = getApp()
  app.globalData.decorationProject.totalBudget = 100000
  console.log('设置预算后:', app.globalData.decorationProject.totalBudget)
  
  // 保存到本地存储
  wx.setStorageSync('decorationProject', app.globalData.decorationProject)
  console.log('已保存到本地存储')
  
  // 读取本地存储
  const saved = wx.getStorageSync('decorationProject')
  console.log('从本地存储读取:', saved)
}

// 3. 清除数据进行重新测试
function clearData() {
  wx.removeStorageSync('decorationProject')
  getApp().globalData.decorationProject.totalBudget = 0
  console.log('数据已清除')
}

// 使用方法：
// testBudget() - 测试预算设置
// clearData() - 清除数据