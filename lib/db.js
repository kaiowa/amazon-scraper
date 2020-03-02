const mysql = require('serverless-mysql')

const db = mysql({
  config: {
    host: 'localhost',
    database: 'amazonscrappdb',
    user: 'root',
    password: ''
  }
})

exports.query = async query => {
  try {
    const results = await db.query(query)
    await db.end()
    return JSON.parse(JSON.stringify(results))
  } catch (error) {
    return { error }
  }
}