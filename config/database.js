const mongoose =  require('mongoose')

const connectDatabase = () =>{
mongoose.connect(process.env.DB_URI)
.then(con=>{
    console.log(`mongodb corriendo en el host ${con.connection.host}`)
})
}

module.exports = connectDatabase