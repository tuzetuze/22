const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { recipeId } = event
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    const existing = await db.collection('favorites')
      .where({
        userId: openId,
        recipeId
      })
      .get()
    
    if (existing.data.length > 0) {
      await db.collection('favorites')
        .where({
          userId: openId,
          recipeId
        })
        .remove()
      
      return {
        success: true,
        data: {
          isFavorited: false,
          message: '已取消收藏'
        }
      }
    } else {
      await db.collection('favorites').add({
        data: {
          userId: openId,
          recipeId,
          createdAt: new Date()
        }
      })
      
      return {
        success: true,
        data: {
          isFavorited: true,
          message: '收藏成功'
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}