const app =  require('./app')
const connectDatabase = require('./config/database')

const dotenv =  require('dotenv')

//handle uncaught exceptions
process.on('uncaughtException', err=>{
    console.log(`ERROR:${err.stack}`);
    console.log('cerrando el servidor por uncaughtException');
    process.exit(1)
})

//configurando archivos de entorno
dotenv.config({path:'backend/config/config.env'})


//conexion base de datos
connectDatabase()

const server = app.listen(process.env.PORT,()=>{
    console.log(`servidor en puerto ${process.env.PORT}  in ${process.env.NODE_ENV} mode`)
})

//handle unhandled promise rejection
process.on('unhandledRejection', err=>{
    console.log(`Error:${err.stack}`);
    console.log('cerrando el servidor por unhandledRejectionPromise')
    server.close(()=>{
        process.exit(1)
    })
})