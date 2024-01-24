const connectToMongo = require('./db')
const express = require('express')
const cors = require('cors')


connectToMongo();


const app = express()
const port = 5000

app.use(cors())
app.use(express.json())
//Available Routes
app.use('/api/auth',require('./routes/auth') )
app.use('/api/notes',require('./routes/notes') )
app.use('/',(req,res)=>{
  return res.json({
    message:"Wecome to noteswift"
  })
})

app.listen(port, () => {
  console.log(`Noteswift listening on port http://localhost:${port}`)
})