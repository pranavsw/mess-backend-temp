const express = require('express')
const loginRouter = require('./routers/loginRouter')
const dataRouter = require("./routers/dataRouter")
const app = express()
const authenticate = require('./middlewares/authenticate')
const PORT = 5000;

app.use(express.json())
app.use('/login', loginRouter)
app.use(authenticate)
app.use("/database", dataRouter)

app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
})