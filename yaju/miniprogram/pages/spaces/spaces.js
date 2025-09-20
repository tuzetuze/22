const app = getApp()

Page({
  data: {
    spaceList: [],
    completedCount: 0
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.loadSpaceData()
  },

  initData() {
    const globalData = app.globalData
    this.setData({
      spaceList: globalData.spaceTypes
    })
  },

  loadSpaceData() {
    const spaces = app.globalData.decorationProject.spaces || {}
    let completedCount = 0
    
    Object.keys(spaces).forEach(spaceId => {
      const space = spaces[spaceId]
      if (space && space.isCompleted) {
        completedCount++
      }
    })
    
    this.setData({
      completedCount: completedCount
    })
  },

  // 获取空间状态文本
  getSpaceStatusText(spaceId) {
    const spaces = app.globalData.decorationProject.spaces
    const space = spaces[spaceId]
    
    if (!space) return '未开始'
    if (space.isCompleted) return '已完成'
    if (space.hasStarted) return '规划中'
    return '未开始'
  },

  // 检查空间是否完成
  isSpaceCompleted(spaceId) {
    const spaces = app.globalData.decorationProject.spaces
    const space = spaces[spaceId]
    return space && space.isCompleted
  },

  // 获取空间预算
  getSpaceBudget(spaceId) {
    const spaces = app.globalData.decorationProject.spaces
    const space = spaces[spaceId]
    return space ? (space.budget || 0) : 0
  },

  // 导航到空间规划页面
  navigateToSpacePlan(e) {
    const space = e.currentTarget.dataset.space
    
    // 检查是否设置了总预算
    const totalBudget = app.globalData.decorationProject.totalBudget
    if (!totalBudget || totalBudget <= 0) {
      wx.showModal({
        title: '提示',
        content: '建议先设置总预算，这样可以更好地控制各房间的花费',
        confirmText: '去设置',
        cancelText: '直接规划',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/index/index'
            })
          } else {
            this.goToSpacePlan(space)
          }
        }
      })
      return
    }
    
    this.goToSpacePlan(space)
  },

  goToSpacePlan(space) {
    wx.navigateTo({
      url: `/pages/space-plan/space-plan?spaceId=${space.id}&spaceName=${space.name}`
    })
  }
})