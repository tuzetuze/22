const app = getApp()

Page({
  data: {
    budgetText: '未设置',
    spaceText: '选择房间',
    usedBudgetText: '￥0',
    completedSpaces: 0,
    totalSpaces: 9,
    
    // 智能引导
    showGuide: true,
    guideIcon: '💰',
    guideTitle: '欢迎使用装修规划助手',
    guideDesc: '让我们从设置预算开始，规划您的理想家居',
    guideButtonText: '设置预算',
    guideAction: 'setBudget',
    
    // 弹窗相关
    showBudgetModal: false,
    tempBudget: '',
    inputFocus: false
  },

  onLoad() {
    console.log('页面加载')
    this.loadSimpleData()
  },

  onShow() {
    console.log('页面显示')
    this.loadSimpleData()
  },

  loadSimpleData() {
    const projectData = app.globalData.decorationProject
    
    if (!projectData) return

    // 预算显示
    const totalBudget = projectData.totalBudget || 0
    const budgetText = totalBudget > 0 ? this.formatBudget(totalBudget) : '未设置'
    
    // 空间统计
    const spaces = projectData.spaces || {}
    const completedSpaces = Object.keys(spaces).filter(id => 
      spaces[id] && spaces[id].isCompleted
    ).length
    const spaceText = completedSpaces > 0 ? `已完成 ${completedSpaces} 个房间` : '选择房间'
    
    // 已用预算
    let usedBudget = 0
    Object.keys(spaces).forEach(spaceId => {
      const space = spaces[spaceId]
      if (space && space.budget) {
        usedBudget += space.budget
      }
    })
    const usedBudgetText = this.formatBudget(usedBudget)
    
    // 智能引导系统
    const guideData = this.generateSmartGuide(totalBudget, completedSpaces)

    this.setData({
      budgetText: budgetText,
      spaceText: spaceText,
      usedBudgetText: usedBudgetText,
      completedSpaces: completedSpaces,
      ...guideData
    })
  },

  generateSmartGuide(totalBudget, completedSpaces) {
    if (totalBudget === 0) {
      return {
        showGuide: true,
        guideIcon: '💰',
        guideTitle: '欢迎使用装修规划助手',
        guideDesc: '让我们从设置预算开始，规划您的理想家居',
        guideButtonText: '设置预算',
        guideAction: 'setBudget'
      }
    } else if (completedSpaces === 0) {
      return {
        showGuide: true,
        guideIcon: '🏠',
        guideTitle: '预算已就绪！',
        guideDesc: '现在可以开始规划各个房间的装修了',
        guideButtonText: '开始规划',
        guideAction: 'goToSpaces'
      }
    } else if (completedSpaces < 3) {
      return {
        showGuide: true,
        guideIcon: '🎆',
        guideTitle: '进展顺利！',
        guideDesc: '继续规划其他房间，让家居梦想更完整',
        guideButtonText: '继续规划',
        guideAction: 'goToSpaces'
      }
    } else {
      return {
        showGuide: false
      }
    }
  },

  formatBudget(amount) {
    if (amount >= 10000) {
      return '￥' + Math.round(amount / 10000 * 10) / 10 + '万'
    }
    return '￥' + amount
  },


  // 设置预算
  setBudget() {
    console.log('打开预算设置弹窗')
    this.setData({
      tempBudget: '',
      showBudgetModal: true,
      inputFocus: false
    })
  },

  onBudgetInput(e) {
    this.setData({
      tempBudget: e.detail.value
    })
  },

  confirmBudget() {
    const budget = parseFloat(this.data.tempBudget) || 0
    
    console.log('设置预算:', budget, '原始输入:', this.data.tempBudget)
    
    if (budget <= 0) {
      wx.showToast({
        title: '请输入有效的预算金额',
        icon: 'none'
      })
      return
    }
    
    // 确保全局数据结构存在
    if (!app.globalData.decorationProject) {
      app.globalData.decorationProject = {
        totalBudget: 0,
        spaces: {},
        createdTime: new Date().toISOString(),
        updatedTime: new Date().toISOString()
      }
    }
    
    app.globalData.decorationProject.totalBudget = budget
    console.log('全局数据更新后:', app.globalData.decorationProject)
    
    this.saveProjectData()
    this.loadSimpleData()
    
    this.setData({
      showBudgetModal: false,
      tempBudget: '',
      inputFocus: false
    })
    
    wx.showToast({
      title: '预算设置成功',
      icon: 'success'
    })
  },

  closeBudgetModal() {
    this.setData({
      showBudgetModal: false,
      tempBudget: '',
      inputFocus: false
    })
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  onInputFocus() {
    this.setData({
      inputFocus: true
    })
  },

  onInputBlur() {
    this.setData({
      inputFocus: false
    })
  },

  // 处理智能引导按钮点击
  handleGuideAction(e) {
    const action = e.currentTarget.dataset.action
    console.log('智能引导点击:', action)
    
    if (action === 'setBudget') {
      this.setBudget()
    } else if (action === 'goToSpaces') {
      this.goToSpaces()
    }
  },

  saveProjectData() {
    const projectData = app.globalData.decorationProject
    projectData.updatedTime = new Date().toISOString()
    wx.setStorageSync('decorationProject', projectData)
  },

  // 导航到其他页面
  goToSpaces() {
    const totalBudget = app.globalData.decorationProject.totalBudget
    if (!totalBudget || totalBudget <= 0) {
      wx.showModal({
        title: '提示',
        content: '建议先设置总预算，这样能更好地分配各房间的预算',
        confirmText: '去设置',
        cancelText: '直接规划',
        success: (res) => {
          if (res.confirm) {
            this.setBudget()
          } else {
            wx.switchTab({
              url: '/pages/spaces/spaces'
            })
          }
        }
      })
      return
    }
    
    wx.switchTab({
      url: '/pages/spaces/spaces'
    })
  },

  goToBudget() {
    wx.switchTab({
      url: '/pages/budget/budget'
    })
  }
})