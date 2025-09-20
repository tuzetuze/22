const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    const recipe = await db.collection('recipes').doc(id).get()
    
    if (!recipe.data) {
      return {
        success: false,
        error: '菜谱不存在'
      }
    }
    
    await db.collection('recipes').doc(id).update({
      data: {
        viewCount: db.command.inc(1)
      }
    })
    
    const isFavorited = await db.collection('favorites')
      .where({
        userId: openId,
        recipeId: id
      })
      .count()
    
    return {
      success: true,
      data: {
        ...recipe.data,
        isFavorited: isFavorited.total > 0
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}