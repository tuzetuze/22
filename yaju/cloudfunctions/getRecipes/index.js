const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { category, difficulty, keyword, page = 1, pageSize = 10 } = event
  
  try {
    let query = {}
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty
    }
    
    if (keyword) {
      query.name = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }
    
    const total = await db.collection('recipes').where(query).count()
    const recipes = await db.collection('recipes')
      .where(query)
      .orderBy('rating', 'desc')
      .orderBy('viewCount', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
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