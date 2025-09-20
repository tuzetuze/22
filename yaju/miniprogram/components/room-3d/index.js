Component({
  properties: {
    // 房间类型
    roomType: {
      type: String,
      value: 'living_room'
    },
    // 房间数据
    roomData: {
      type: Object,
      value: {}
    },
    // 是否显示家具
    showFurniture: {
      type: Boolean,
      value: true
    },
    // 视角模式
    viewMode: {
      type: String,
      value: 'perspective' // perspective, top, side
    }
  },

  data: {
    // 房间配置
    roomConfig: {
      living_room: {
        name: '客厅',
        defaultSize: { width: 400, height: 300, depth: 350 },
        color: '#f5f5f5',
        furniture: [
          { type: 'sofa', x: 50, y: 200, z: 0, width: 180, height: 80, depth: 90 },
          { type: 'table', x: 150, y: 120, z: 0, width: 100, height: 40, depth: 60 },
          { type: 'tv', x: 300, y: 10, z: 0, width: 150, height: 80, depth: 20 }
        ]
      },
      bedroom: {
        name: '卧室',
        defaultSize: { width: 350, height: 300, depth: 300 },
        color: '#fff8f0',
        furniture: [
          { type: 'bed', x: 50, y: 100, z: 0, width: 200, height: 40, depth: 150 },
          { type: 'wardrobe', x: 280, y: 50, z: 0, width: 60, height: 200, depth: 50 },
          { type: 'desk', x: 50, y: 20, z: 0, width: 120, height: 70, depth: 60 }
        ]
      },
      kitchen: {
        name: '厨房',
        defaultSize: { width: 300, height: 250, depth: 280 },
        color: '#f8f8ff',
        furniture: [
          { type: 'cabinet', x: 20, y: 200, z: 0, width: 250, height: 80, depth: 60 },
          { type: 'island', x: 80, y: 100, z: 0, width: 120, height: 80, depth: 80 },
          { type: 'fridge', x: 250, y: 50, z: 0, width: 60, height: 150, depth: 60 }
        ]
      },
      bathroom: {
        name: '卫生间',
        defaultSize: { width: 200, height: 200, depth: 200 },
        color: '#f0f8ff',
        furniture: [
          { type: 'toilet', x: 150, y: 150, z: 0, width: 40, height: 40, depth: 60 },
          { type: 'sink', x: 20, y: 150, z: 0, width: 80, height: 80, depth: 40 },
          { type: 'shower', x: 20, y: 20, z: 0, width: 80, height: 80, depth: 80 }
        ]
      }
    },
    
    // 当前房间配置
    currentRoom: {},
    
    // 房间面积（计算后的值）
    roomArea: '0.0',
    
    // 地板瓷砖数据
    floorTiles: [],
    
    // 触摸手势数据
    touchStartX: 0,
    touchStartY: 0,
    lastRotateX: 45,
    lastRotateY: -30,
    customTransform: '',
    
    // 性能优化相关
    isMoving: false,
    moveTimer: null,
    
    // 家具颜色配置
    furnitureColors: {
      sofa: '#8B4513',
      table: '#D2691E', 
      tv: '#2F4F4F',
      bed: '#CD853F',
      wardrobe: '#A0522D',
      desk: '#D2B48C',
      cabinet: '#F5DEB3',
      island: '#DEB887',
      fridge: '#E6E6FA',
      toilet: '#FFFFFF',
      sink: '#F0F8FF',
      shower: '#E0E0E0'
    }
  },

  lifetimes: {
    attached() {
      this.initRoom();
    }
  },

  observers: {
    'roomType, roomData': function(roomType, roomData) {
      this.initRoom();
    }
  },

  methods: {
    // 初始化房间
    initRoom() {
      const { roomType, roomData } = this.properties;
      const config = this.data.roomConfig[roomType] || this.data.roomConfig.living_room;
      
      // 合并默认配置和用户数据
      const currentRoom = {
        ...config,
        ...roomData,
        size: roomData.size || config.defaultSize
      };
      
      // 计算房间面积
      const area = (currentRoom.size.width * currentRoom.size.depth / 10000).toFixed(1);
      
      // 生成地板瓷砖
      const floorTiles = this.generateFloorTiles(currentRoom.size);
      
      this.setData({ 
        currentRoom,
        roomArea: area,
        floorTiles: floorTiles
      });
    },

    // 切换视角
    switchView(e) {
      const viewMode = e.currentTarget.dataset.mode;
      this.setData({ viewMode });
    },

    // 切换家具显示
    toggleFurniture() {
      this.setData({
        showFurniture: !this.data.showFurniture
      });
    },

    // 家具点击事件
    onFurnitureClick(e) {
      const furniture = e.currentTarget.dataset.furniture;
      this.triggerEvent('furnitureClick', { furniture });
    },

    // 房间点击事件
    onRoomClick(e) {
      this.triggerEvent('roomClick', { 
        roomType: this.properties.roomType,
        roomData: this.data.currentRoom
      });
    },

    // 生成地板瓷砖
    generateFloorTiles(size) {
      const tiles = [];
      const tileSize = 40; // 瓷砖大小 40rpx
      const cols = Math.floor(size.width / tileSize);
      const rows = Math.floor(size.height / tileSize);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // 只生成部分瓷砖以提高性能
          if ((i + j) % 3 === 0) {
            tiles.push({
              x: i * tileSize,
              y: j * tileSize
            });
          }
        }
      }
      
      return tiles;
    },

    // 触摸开始
    onTouchStart(e) {
      if (e.touches.length === 1) {
        this.setData({
          touchStartX: e.touches[0].clientX,
          touchStartY: e.touches[0].clientY
        });
      }
    },

    // 触摸移动（带节流优化）
    onTouchMove(e) {
      if (e.touches.length === 1 && this.properties.viewMode === 'perspective') {
        // 节流优化，避免过频繁的setData
        if (this.data.isMoving) return;
        
        this.setData({ isMoving: true });
        
        const deltaX = e.touches[0].clientX - this.data.touchStartX;
        const deltaY = e.touches[0].clientY - this.data.touchStartY;
        
        const rotateY = this.data.lastRotateY + deltaX * 0.5;
        const rotateX = Math.max(10, Math.min(80, this.data.lastRotateX - deltaY * 0.5));
        
        // 实时更新旋转角度
        const transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(0deg)`;
        this.setData({
          customTransform: transform
        });
        
        // 16ms后允许下次更新（约60fps）
        setTimeout(() => {
          this.setData({ isMoving: false });
        }, 16);
      }
    },

    // 触摸结束
    onTouchEnd(e) {
      if (this.data.customTransform) {
        // 保存最终的旋转角度
        const deltaX = e.changedTouches[0].clientX - this.data.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.data.touchStartY;
        
        const rotateY = this.data.lastRotateY + deltaX * 0.5;
        const rotateX = Math.max(10, Math.min(80, this.data.lastRotateX - deltaY * 0.5));
        
        this.setData({
          lastRotateX: rotateX,
          lastRotateY: rotateY,
          customTransform: ''
        });
      }
    }
  }
});
