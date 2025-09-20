const app = getApp()

Page({
  data: {
    spaceId: '',
    spaceName: '',
    spaceIcon: '',
    spaceBudget: '',
    totalBudget: 0,
    budgetReferences: [],
    selectedReference: null,
    spaceFeatures: [],
    canSave: false,
    showSuccess: false,
    inputFocus: false,
    // 3D相关数据
    spaceType: '',
    roomData: {}
  },

  onLoad(options) {
    const { spaceId, spaceName } = options
    this.setData({
      spaceId: spaceId,
      spaceName: spaceName
    })
    
    this.initSpaceData()
    this.loadExistingData()
  },

  initSpaceData() {
    // 获取空间图标
    const spaceTypes = app.globalData.spaceTypes
    const spaceType = spaceTypes.find(s => s.id === this.data.spaceId)
    const spaceIcon = spaceType ? spaceType.icon : '🏠'
    
    // 获取总预算
    const totalBudget = app.globalData.decorationProject.totalBudget || 0
    
    // 生成预算参考建议
    const budgetReferences = this.generateBudgetReferences(totalBudget)
    
    // 生成空间特征选项
    const spaceFeatures = this.generateSpaceFeatures(this.data.spaceId)
    
    // 初始化3D房间数据
    const roomData = this.generateRoomData(this.data.spaceId)
    
    this.setData({
      spaceIcon: spaceIcon,
      totalBudget: totalBudget,
      budgetReferences: budgetReferences,
      spaceFeatures: spaceFeatures,
      spaceType: this.mapSpaceIdToType(this.data.spaceId),
      roomData: roomData
    })
  },

  loadExistingData() {
    // 加载已有的空间规划数据
    const spaces = app.globalData.decorationProject.spaces || {}
    const existingSpace = spaces[this.data.spaceId]
    
    if (existingSpace) {
      const selectedFeatures = existingSpace.features || []
      const updatedFeatures = this.data.spaceFeatures.map(feature => ({
        ...feature,
        selected: selectedFeatures.includes(feature.id)
      }))
      
      this.setData({
        spaceBudget: existingSpace.budget ? existingSpace.budget.toString() : '',
        spaceFeatures: updatedFeatures,
        canSave: !!existingSpace.budget
      })
    }
  },

  generateBudgetReferences(totalBudget) {
    if (totalBudget <= 0) return []
    
    const spaceId = this.data.spaceId
    let references = []
    
    // 根据不同房间类型给出不同的预算建议
    switch (spaceId) {
      case 'living_room':
        references = [
          { label: '经济型', percent: 20, amount: Math.round(totalBudget * 0.20) },
          { label: '舒适型', percent: 25, amount: Math.round(totalBudget * 0.25) },
          { label: '豪华型', percent: 30, amount: Math.round(totalBudget * 0.30) }
        ]
        break
      case 'master_bedroom':
        references = [
          { label: '经济型', percent: 15, amount: Math.round(totalBudget * 0.15) },
          { label: '舒适型', percent: 20, amount: Math.round(totalBudget * 0.20) },
          { label: '豪华型', percent: 25, amount: Math.round(totalBudget * 0.25) }
        ]
        break
      case 'kitchen':
        references = [
          { label: '经济型', percent: 15, amount: Math.round(totalBudget * 0.15) },
          { label: '舒适型', percent: 20, amount: Math.round(totalBudget * 0.20) },
          { label: '豪华型', percent: 25, amount: Math.round(totalBudget * 0.25) }
        ]
        break
      case 'bathroom':
        references = [
          { label: '经济型', percent: 10, amount: Math.round(totalBudget * 0.10) },
          { label: '舒适型', percent: 15, amount: Math.round(totalBudget * 0.15) },
          { label: '豪华型', percent: 20, amount: Math.round(totalBudget * 0.20) }
        ]
        break
      default:
        references = [
          { label: '经济型', percent: 8, amount: Math.round(totalBudget * 0.08) },
          { label: '舒适型', percent: 12, amount: Math.round(totalBudget * 0.12) },
          { label: '豪华型', percent: 15, amount: Math.round(totalBudget * 0.15) }
        ]
    }
    
    return references
  },

  generateSpaceFeatures(spaceId) {
    const featuresMap = {
      living_room: [
        { id: 'flooring', name: '地板翻新', icon: '🏠' },
        { id: 'wall', name: '墙面装饰', icon: '🎨' },
        { id: 'lighting', name: '灯光设计', icon: '💡' },
        { id: 'furniture', name: '家具配置', icon: '🛋️' }
      ],
      master_bedroom: [
        { id: 'flooring', name: '地板', icon: '🏠' },
        { id: 'wall', name: '墙面', icon: '🎨' },
        { id: 'wardrobe', name: '衣柜', icon: '👕' },
        { id: 'lighting', name: '灯光', icon: '💡' }
      ],
      kitchen: [
        { id: 'cabinets', name: '橱柜', icon: '🗄️' },
        { id: 'appliances', name: '电器', icon: '🔌' },
        { id: 'countertop', name: '台面', icon: '📱' },
        { id: 'lighting', name: '灯光', icon: '💡' }
      ],
      bathroom: [
        { id: 'tiles', name: '瓷砖', icon: '🟫' },
        { id: 'shower', name: '淋浴设备', icon: '🚿' },
        { id: 'vanity', name: '洗手台', icon: '🪞' },
        { id: 'lighting', name: '灯光', icon: '💡' }
      ]
    }
    
    const defaultFeatures = [
      { id: 'basic', name: '基础装修', icon: '🔧' },
      { id: 'paint', name: '墙面涂料', icon: '🎨' },
      { id: 'lighting', name: '照明', icon: '💡' }
    ]
    
    return (featuresMap[spaceId] || defaultFeatures).map(feature => ({
      ...feature,
      selected: false
    }))
  },

  onBudgetInput(e) {
    const budget = e.detail.value
    this.setData({
      spaceBudget: budget,
      canSave: budget && parseFloat(budget) > 0,
      selectedReference: null
    })
  },

  selectReference(e) {
    const { percent, amount } = e.currentTarget.dataset
    this.setData({
      spaceBudget: amount.toString(),
      selectedReference: percent,
      canSave: true
    })
  },

  toggleFeature(e) {
    const featureId = e.currentTarget.dataset.id
    const features = this.data.spaceFeatures.map(feature => 
      feature.id === featureId 
        ? { ...feature, selected: !feature.selected }
        : feature
    )
    
    this.setData({
      spaceFeatures: features
    })
  },

  saveSpacePlan() {
    const budget = parseFloat(this.data.spaceBudget) || 0
    
    if (budget <= 0) {
      wx.showToast({
        title: '请输入有效预算',
        icon: 'none'
      })
      return
    }
    
    // 保存空间规划数据
    const spaceData = {
      budget: budget,
      features: this.data.spaceFeatures
        .filter(f => f.selected)
        .map(f => f.id),
      hasStarted: true,
      isCompleted: true,
      updatedTime: new Date().toISOString()
    }
    
    // 更新全局数据
    if (!app.globalData.decorationProject.spaces) {
      app.globalData.decorationProject.spaces = {}
    }
    app.globalData.decorationProject.spaces[this.data.spaceId] = spaceData
    
    // 保存到本地存储
    const projectData = app.globalData.decorationProject
    projectData.updatedTime = new Date().toISOString()
    wx.setStorageSync('decorationProject', projectData)
    
    // 显示成功提示
    this.setData({
      showSuccess: true
    })
    
    setTimeout(() => {
      this.setData({
        showSuccess: false
      })
      this.goBack()
    }, 1500)
  },

  goBack() {
    wx.navigateBack()
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

  // 3D相关方法
  mapSpaceIdToType(spaceId) {
    const mapping = {
      'living_room': 'living_room',
      'dining_room': 'living_room', 
      'master_bedroom': 'bedroom',
      'second_bedroom': 'bedroom',
      'guest_bedroom': 'bedroom',
      'kitchen': 'kitchen',
      'bathroom': 'bathroom',
      'master_bathroom': 'bathroom',
      'study': 'bedroom',
      'entrance': 'living_room',
      'balcony': 'living_room'
    }
    return mapping[spaceId] || 'living_room'
  },

  generateRoomData(spaceId) {
    // 根据不同房间类型生成对应的房间数据
    const roomSizes = {
      'living_room': { width: 500, height: 400, depth: 450 },
      'dining_room': { width: 400, height: 350, depth: 350 },
      'master_bedroom': { width: 450, height: 400, depth: 400 },
      'second_bedroom': { width: 350, height: 300, depth: 300 },
      'guest_bedroom': { width: 300, height: 280, depth: 280 },
      'kitchen': { width: 350, height: 280, depth: 320 },
      'bathroom': { width: 250, height: 220, depth: 220 },
      'master_bathroom': { width: 300, height: 250, depth: 250 },
      'study': { width: 300, height: 280, depth: 300 },
      'entrance': { width: 200, height: 150, depth: 180 },
      'balcony': { width: 300, height: 200, depth: 150 }
    }

    const defaultSize = { width: 400, height: 300, depth: 350 }
    const size = roomSizes[spaceId] || defaultSize

    return {
      name: this.data.spaceName,
      size: size,
      style: '现代简约',
      mainColor: '#f5f5f5'
    }
  },

  // 家具点击事件处理
  onFurnitureClick(e) {
    const { furniture } = e.detail
    wx.showModal({
      title: '家具信息',
      content: `类型: ${furniture.type}\n尺寸: ${furniture.width}×${furniture.depth}×${furniture.height}`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 房间点击事件处理
  onRoomClick(e) {
    const { roomType, roomData } = e.detail
    const area = (roomData.size.width * roomData.size.depth / 10000).toFixed(1)
    wx.showModal({
      title: '房间信息',
      content: `房间: ${roomData.name}\n面积: ${area}㎡`,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})