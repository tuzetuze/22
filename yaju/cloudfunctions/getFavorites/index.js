const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10 } = event
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    const favorites = await db.collection('favorites')
      .where({
        userId: openId
      })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    const recipeIds = favorites.data.map(fav => fav.recipeId)
    
    if (recipeIds.length === 0) {
      return {
        success: true,
        data: {
          recipes: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0
        }
      }
    }
    
    const recipes = await db.collection('recipes')
      .where({
        _id: db.command.in(recipeIds)
      })
      .get()
    
    const total = await db.collection('favorites')
      .where({
        userId: openId
      })
      .count()
    
    return {
      success: true,
      data: {
        recipes: recipes.data,
        total: total.total,
        page,
        pageSize,
        totalPages: Math.ceil(total.total / pageSize)
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}