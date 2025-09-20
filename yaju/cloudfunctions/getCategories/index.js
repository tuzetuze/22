const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const categories = await db.collection('categories')
      .orderBy('sortOrder', 'asc')
      .get()
    
    const stats = await Promise.all(
      categories.data.map(async (category) => {
        const count = await db.collection('recipes')
          .where({
            category: category._id
          })
          .count()
        
        return {
          ...category,
          recipeCount: count.total
        }
      })
    )
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}