App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-3gl3tibg49bf0dab',
        traceUser: true,
      })
    }

    // 初始化装修项目数据
    this.initDecorationProject()
  },

  globalData: {
    userInfo: null,
    // 装修项目数据
    decorationProject: {
      id: null,
      name: '',
      totalBudget: 0,
      usedBudget: 0,
      mainStyle: '', // 主题风格
      spaces: {}, // 空间数据
      createdTime: null,
      updatedTime: null
    },
    // 空间类型配置
    spaceTypes: [
      { id: 'living_room', name: '客厅', icon: '🛋️', color: '#4CAF50' },
      { id: 'dining_room', name: '餐厅', icon: '🍽️', color: '#FF9800' },
      { id: 'master_bedroom', name: '主卧', icon: '🛏️', color: '#E91E63' },
      { id: 'secondary_bedroom', name: '次卧', icon: '🛌', color: '#9C27B0' },
      { id: 'kitchen', name: '厨房', icon: '🍳', color: '#FF5722' },
      { id: 'bathroom', name: '卫生间', icon: '🚿', color: '#00BCD4' },
      { id: 'study', name: '书房', icon: '📚', color: '#3F51B5' },
      { id: 'entrance', name: '玄关', icon: '🚪', color: '#795548' },
      { id: 'balcony', name: '阳台', icon: '🌱', color: '#8BC34A' }
    ],
    // 装修风格配置
    decorationStyles: [
      { id: 'modern', name: '现代简约', color: '#2196F3' },
      { id: 'nordic', name: '北欧风格', color: '#607D8B' },
      { id: 'chinese', name: '新中式', color: '#8BC34A' },
      { id: 'american', name: '美式风格', color: '#795548' },
      { id: 'european', name: '欧式风格', color: '#FF9800' },
      { id: 'industrial', name: '工业风', color: '#455A64' }
    ]
  },

  // 初始化装修项目数据
  initDecorationProject() {
    // 尝试从本地存储加载数据
    try {
      const savedProject = wx.getStorageSync('decorationProject')
      if (savedProject && savedProject.totalBudget !== undefined) {
        this.globalData.decorationProject = {
          ...this.globalData.decorationProject,
          ...savedProject
        }
      } else {
        // 初始化默认数据
        this.globalData.decorationProject.createdTime = new Date().toISOString()
        this.globalData.decorationProject.updatedTime = new Date().toISOString()
      }
    } catch (e) {
      console.error('加载装修项目数据失败:', e)
      // 初始化默认数据
      this.globalData.decorationProject.createdTime = new Date().toISOString()
      this.globalData.decorationProject.updatedTime = new Date().toISOString()
    }
  }
}) 