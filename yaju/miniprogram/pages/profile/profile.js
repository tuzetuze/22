const app = getApp()

Page({
  data: {
    openId: '',
    completedSpaces: 0,
    totalBudget: '0',
    completionRate: 0,
    projectDays: 0
  },

  onLoad() {
    this.loadUserInfo()
    this.loadProjectStats()
  },

  onShow() {
    this.loadProjectStats()
  },

  loadUserInfo() {
    // 获取用户 OpenID
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        this.setData({
          openId: res.result.openid
        })
      },
      fail: err => {
        console.error('获取OpenID失败', err)
      }
    })
  },

  loadProjectStats() {
    const projectData = app.globalData.decorationProject
    
    if (!projectData) return

    // 计算完成空间数
    const spaces = projectData.spaces || {}
    let completedCount = 0
    
    Object.keys(spaces).forEach(spaceId => {
      if (spaces[spaceId] && spaces[spaceId].isCompleted) {
        completedCount++
      }
    })

    // 计算完成率
    const totalSpaces = app.globalData.spaceTypes.length
    const rate = totalSpaces > 0 ? Math.round((completedCount / totalSpaces) * 100) : 0

    // 计算项目天数
    const createdTime = new Date(projectData.createdTime || Date.now())
    const now = new Date()
    const days = Math.ceil((now - createdTime) / (1000 * 60 * 60 * 24))

    this.setData({
      completedSpaces: completedCount,
      totalBudget: this.formatBudget(projectData.totalBudget || 0),
      completionRate: rate,
      projectDays: Math.max(days, 1)
    })
  },

  formatBudget(amount) {
    if (amount >= 10000) {
      return Math.round(amount / 10000 * 10) / 10 + '万'
    }
    return amount.toString()
  },

  // 导出项目
  exportProject() {
    const completionRate = this.data.completionRate
    
    if (completionRate < 50) {
      wx.showToast({
        title: '完成度需达到50%才能导出',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '生成中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '导出成功',
        content: '装修方案已生成，是否保存到相册？',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({
              title: '已保存到相册',
              icon: 'success'
            })
          }
        }
      })
    }, 2000)
  },

  // 分享项目
  shareProject() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 重置项目
  resetProject() {
    wx.showModal({
      title: '确认重置',
      content: '重置后将清空所有规划数据，此操作无法撤销',
      confirmText: '确认重置',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          // 重置项目数据
          const newProject = {
            id: Date.now(),
            name: '我的装修项目',
            totalBudget: 0,
            usedBudget: 0,
            mainStyle: '',
            spaces: {},
            createdTime: new Date().toISOString(),
            updatedTime: new Date().toISOString()
          }
          
          app.globalData.decorationProject = newProject
          wx.setStorageSync('decorationProject', newProject)
          
          this.loadProjectStats()
          
          wx.showToast({
            title: '项目已重置',
            icon: 'success'
          })
        }
      }
    })
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于全屋装修助手',
      content: '一个帮助用户从零开始进行全屋装修规划的小程序，提供空间规划、预算管理、风格设计等功能。',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
})