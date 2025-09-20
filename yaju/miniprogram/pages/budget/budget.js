const app = getApp()

Page({
  data: {
    totalBudget: 0,
    usedBudget: 0,
    remainingBudget: 0,
    usagePercentage: 0,
    spaceBudgets: [],
    showBudgetModal: false,
    tempBudget: '',
    inputFocus: false
  },

  onLoad() {
    this.loadBudgetData()
  },

  onShow() {
    this.loadBudgetData()
  },

  loadBudgetData() {
    const projectData = app.globalData.decorationProject
    
    if (!projectData) return

    const totalBudget = projectData.totalBudget || 0
    const spaces = projectData.spaces || {}
    const spaceTypes = app.globalData.spaceTypes

    // 计算已用预算和空间列表
    let usedBudget = 0
    const spaceBudgets = []

    spaceTypes.forEach(spaceType => {
      const space = spaces[spaceType.id]
      const budget = space ? (space.budget || 0) : 0
      
      if (budget > 0) {
        usedBudget += budget
        const percentage = totalBudget > 0 ? Math.round((budget / totalBudget) * 100) : 0
        spaceBudgets.push({
          id: spaceType.id,
          name: spaceType.name,
          icon: spaceType.icon,
          budget: budget,
          percentage: percentage
        })
      }
    })

    const remainingBudget = totalBudget - usedBudget
    const usagePercentage = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0

    this.setData({
      totalBudget: totalBudget,
      usedBudget: usedBudget,
      remainingBudget: remainingBudget,
      usagePercentage: usagePercentage,
      spaceBudgets: spaceBudgets
    })
  },


  // 设置预算
  setBudget() {
    this.setData({
      tempBudget: this.data.totalBudget > 0 ? this.data.totalBudget.toString() : '',
      showBudgetModal: true
    })
  },

  onBudgetInput(e) {
    this.setData({
      tempBudget: e.detail.value
    })
  },

  confirmBudget() {
    const budget = parseFloat(this.data.tempBudget) || 0
    
    if (budget <= 0) {
      wx.showToast({
        title: '请输入有效的预算金额',
        icon: 'none'
      })
      return
    }

    app.globalData.decorationProject.totalBudget = budget
    this.saveProjectData()
    this.loadBudgetData()
    
    this.setData({
      showBudgetModal: false,
      tempBudget: ''
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

  saveProjectData() {
    const projectData = app.globalData.decorationProject
    projectData.updatedTime = new Date().toISOString()
    wx.setStorageSync('decorationProject', projectData)
  }
})