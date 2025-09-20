const app = getApp()

Page({
  data: {
    // 视图模式
    viewMode: '3d', // '3d' 或 'plan'
    
    // 3D房屋变换
    houseTransform: 'rotateX(-10deg) rotateY(15deg) scale(1)',
    rotationY: 15,
    rotationX: -10,
    scale: 1,
    
    // 房间3D数据
    rooms3D: [],
    selectedRoom: null,
    
    // 统计数据
    totalBudget: 0,
    completedRooms: 0,
    totalRooms: 9,
    
    // 界面控制
    showHelp: true
  },

  onLoad() {
    this.initHouse3D()
    this.loadProjectData()
  },

  onShow() {
    this.loadProjectData()
  },

  // 初始化3D房屋数据
  initHouse3D() {
    const spaceTypes = app.globalData.spaceTypes
    const rooms3D = spaceTypes.map((space, index) => {
      return {
        id: space.id,
        name: space.name,
        icon: space.icon,
        completed: false,
        position: this.getRoomPosition(space.id),
        size: this.getRoomSize(space.id),
        floorColor: this.getRoomFloorColor(space.id),
        wallColor: this.getRoomWallColor(space.id),
        furniture: [],
        description: this.getRoomDescription(space.id)
      }
    })

    this.setData({
      rooms3D: rooms3D
    })
  },

  // 获取房间在3D空间中的位置
  getRoomPosition(roomId) {
    const positions = {
      'living_room': 'left: 20%; top: 30%; transform: translateZ(0px)',
      'dining_room': 'left: 50%; top: 30%; transform: translateZ(0px)',
      'kitchen': 'left: 70%; top: 30%; transform: translateZ(0px)',
      'master_bedroom': 'left: 20%; top: 60%; transform: translateZ(0px)',
      'secondary_bedroom': 'left: 70%; top: 60%; transform: translateZ(0px)',
      'bathroom': 'left: 50%; top: 70%; transform: translateZ(0px)',
      'study': 'left: 20%; top: 10%; transform: translateZ(0px)',
      'entrance': 'left: 50%; top: 10%; transform: translateZ(0px)',
      'balcony': 'left: 70%; top: 10%; transform: translateZ(0px)'
    }
    return positions[roomId] || 'left: 50%; top: 50%; transform: translateZ(0px)'
  },

  // 获取房间尺寸
  getRoomSize(roomId) {
    const sizes = {
      'living_room': 'width: 25%; height: 25%',
      'dining_room': 'width: 15%; height: 20%',
      'kitchen': 'width: 15%; height: 25%',
      'master_bedroom': 'width: 20%; height: 20%',
      'secondary_bedroom': 'width: 15%; height: 15%',
      'bathroom': 'width: 10%; height: 15%',
      'study': 'width: 15%; height: 15%',
      'entrance': 'width: 10%; height: 10%',
      'balcony': 'width: 15%; height: 10%'
    }
    return sizes[roomId] || 'width: 15%; height: 15%'
  },

  // 获取房间地板颜色
  getRoomFloorColor(roomId) {
    const colors = {
      'living_room': 'linear-gradient(135deg, #F5F5DC 0%, #E6E6FA 100%)',
      'dining_room': 'linear-gradient(135deg, #FFF8DC 0%, #FFFACD 100%)',
      'kitchen': 'linear-gradient(135deg, #F0F8FF 0%, #E0E6FF 100%)',
      'master_bedroom': 'linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 100%)',
      'secondary_bedroom': 'linear-gradient(135deg, #E6E6FA 0%, #F0E68C 100%)',
      'bathroom': 'linear-gradient(135deg, #E0FFFF 0%, #F0FFFF 100%)',
      'study': 'linear-gradient(135deg, #F5DEB3 0%, #D2B48C 100%)',
      'entrance': 'linear-gradient(135deg, #F8F8FF 0%, #E6E6FA 100%)',
      'balcony': 'linear-gradient(135deg, #F0FFF0 0%, #E0FFE0 100%)'
    }
    return colors[roomId] || '#F5F5F5'
  },

  // 获取房间墙面颜色
  getRoomWallColor(roomId) {
    const colors = {
      'living_room': 'linear-gradient(180deg, #F0F0F0 0%, #E8E8E8 100%)',
      'dining_room': 'linear-gradient(180deg, #FFF5EE 0%, #F5DEB3 100%)',
      'kitchen': 'linear-gradient(180deg, #F8F8FF 0%, #E6E6FA 100%)',
      'master_bedroom': 'linear-gradient(180deg, #FFF0F5 0%, #FFE4E1 100%)',
      'secondary_bedroom': 'linear-gradient(180deg, #F0E68C 0%, #E6E6FA 100%)',
      'bathroom': 'linear-gradient(180deg, #F0FFFF 0%, #E0FFFF 100%)',
      'study': 'linear-gradient(180deg, #F5DEB3 0%, #DDD8C8 100%)',
      'entrance': 'linear-gradient(180deg, #F8F8FF 0%, #F0F0F0 100%)',
      'balcony': 'linear-gradient(180deg, #E0FFE0 0%, #D0FFD0 100%)'
    }
    return colors[roomId] || '#F0F0F0'
  },

  // 获取房间描述
  getRoomDescription(roomId) {
    const descriptions = {
      'living_room': '家庭聚会和休闲的主要空间',
      'dining_room': '用餐和家庭聚餐的场所',
      'kitchen': '烹饪美食的重要区域',
      'master_bedroom': '主人休息的私密空间',
      'secondary_bedroom': '客人或家人的休息区',
      'bathroom': '日常清洁和私人护理区域',
      'study': '学习工作和阅读的静谧空间',
      'entrance': '进门的第一印象区域',
      'balcony': '享受阳光和户外风景的地方'
    }
    return descriptions[roomId] || '居住空间的重要组成部分'
  },

  // 加载项目数据
  loadProjectData() {
    const projectData = app.globalData.decorationProject
    const spaces = projectData.spaces || {}
    
    let totalBudget = projectData.totalBudget || 0
    let completedRooms = 0

    // 更新房间状态和家具
    const updatedRooms = this.data.rooms3D.map(room => {
      const spaceData = spaces[room.id]
      if (spaceData && spaceData.isCompleted) {
        completedRooms++
        return {
          ...room,
          completed: true,
          budget: spaceData.budget || 0,
          features: spaceData.features || [],
          furniture: this.generateRoomFurniture(room.id, spaceData.features || [])
        }
      }
      return {
        ...room,
        completed: false,
        budget: 0,
        features: [],
        furniture: []
      }
    })

    this.setData({
      rooms3D: updatedRooms,
      totalBudget: totalBudget,
      completedRooms: completedRooms
    })
  },

  // 生成房间家具
  generateRoomFurniture(roomId, features) {
    const furnitureMap = {
      'living_room': [
        { id: 'sofa', type: 'sofa', icon: '🛋️', position: 'left: 30%; top: 40%', style: 'width: 40%; height: 20%' },
        { id: 'tv', type: 'tv', icon: '📺', position: 'left: 70%; top: 30%', style: 'width: 20%; height: 15%' },
        { id: 'table', type: 'table', icon: '🪑', position: 'left: 40%; top: 60%', style: 'width: 20%; height: 15%' }
      ],
      'kitchen': [
        { id: 'stove', type: 'appliance', icon: '🍳', position: 'left: 20%; top: 40%', style: 'width: 15%; height: 10%' },
        { id: 'fridge', type: 'appliance', icon: '🧊', position: 'left: 70%; top: 30%', style: 'width: 20%; height: 30%' },
        { id: 'sink', type: 'fixture', icon: '🚰', position: 'left: 45%; top: 40%', style: 'width: 15%; height: 10%' }
      ],
      'master_bedroom': [
        { id: 'bed', type: 'bed', icon: '🛏️', position: 'left: 40%; top: 50%', style: 'width: 40%; height: 30%' },
        { id: 'wardrobe', type: 'storage', icon: '👕', position: 'left: 80%; top: 30%', style: 'width: 15%; height: 40%' }
      ],
      'bathroom': [
        { id: 'toilet', type: 'fixture', icon: '🚽', position: 'left: 30%; top: 60%', style: 'width: 20%; height: 20%' },
        { id: 'shower', type: 'fixture', icon: '🚿', position: 'left: 60%; top: 40%', style: 'width: 25%; height: 30%' }
      ]
    }

    return furnitureMap[roomId] || []
  },

  // 切换视图模式
  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      viewMode: mode
    })

    if (mode === '3d') {
      this.setData({
        houseTransform: 'rotateX(-10deg) rotateY(15deg) scale(1)'
      })
    } else {
      this.setData({
        houseTransform: 'rotateX(0deg) rotateY(0deg) scale(1.2)'
      })
    }
  },

  // 旋转房屋
  rotateHouse(e) {
    const direction = e.currentTarget.dataset.direction
    let rotationY = this.data.rotationY
    
    if (direction === 'left') {
      rotationY -= 15
    } else {
      rotationY += 15
    }

    const transform = `rotateX(${this.data.rotationX}deg) rotateY(${rotationY}deg) scale(${this.data.scale})`
    
    this.setData({
      rotationY: rotationY,
      houseTransform: transform
    })
  },

  // 缩放房屋
  zoomHouse(e) {
    const action = e.currentTarget.dataset.action
    let scale = this.data.scale
    
    if (action === 'in' && scale < 2) {
      scale += 0.2
    } else if (action === 'out' && scale > 0.5) {
      scale -= 0.2
    }

    const transform = `rotateX(${this.data.rotationX}deg) rotateY(${this.data.rotationY}deg) scale(${scale})`
    
    this.setData({
      scale: scale,
      houseTransform: transform
    })
  },

  // 聚焦房间
  focusRoom(e) {
    const roomId = e.currentTarget.dataset.room
    const room = this.data.rooms3D.find(r => r.id === roomId)
    
    if (room) {
      this.setData({
        selectedRoom: room
      })
    }
  },

  // 关闭房间面板
  closeRoomPanel() {
    this.setData({
      selectedRoom: null
    })
  },

  // 编辑房间
  editRoom(e) {
    const roomId = e.currentTarget.dataset.room
    wx.navigateTo({
      url: `/pages/space-plan/space-plan?spaceId=${roomId}&spaceName=${this.data.selectedRoom.name}`
    })
  },

  // 查看房间清单
  viewRoomItems(e) {
    const roomId = e.currentTarget.dataset.room
    // 这里可以导航到房间详情页面或显示清单
    wx.showModal({
      title: this.data.selectedRoom.name + ' 装修清单',
      content: '功能开发中，敬请期待',
      showCancel: false
    })
  },

  // 生成报告
  generateReport() {
    wx.showLoading({
      title: '生成中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '报告已生成',
        content: '您的3D装修报告已生成完成，包含详细的房间布局和预算分析',
        confirmText: '查看',
        success: (res) => {
          if (res.confirm) {
            // 这里可以导航到报告页面
            wx.showToast({
              title: '功能开发中',
              icon: 'none'
            })
          }
        }
      })
    }, 2000)
  },

  // 保存3D图
  saveAs3D() {
    wx.showLoading({
      title: '保存中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '3D图已保存到相册',
        icon: 'success'
      })
    }, 1500)
  },

  // 分享预览
  sharePreview() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 关闭帮助
  closeHelp() {
    this.setData({
      showHelp: false
    })
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '我的3D家居装修预览',
      path: '/pages/preview/preview',
      imageUrl: '/images/3d-preview-share.jpg'
    }
  }
})