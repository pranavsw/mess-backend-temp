const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'env/.env' })

function authenticate(req, res, next) {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]
    if (token == null) {
        res.status(401).json({ success: 'false', msg: 'missing valid authentication' })
    }
    else {
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                res.status(403).json({ success: 'false', msg: "access forbidden" })
            }
            else {
                req.user = user
                next()
            }
        })
    }
}

module.exports = authenticate