const express = require('express')
const jwt = require("jsonwebtoken")
const { sha1, verifyHash } = require('sha1-hash-and-verify')
let loginRouter = express.Router()
const pool = require('../database')
const { Sequelize, DataTypes, where } = require('sequelize');
require('dotenv').config({ path: 'env/.env' })

const dbConfig = require('../db.config')
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST, dialect: dbConfig.dialect,
    operationsAliases: false, pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
})

const Users = sequelize.define("users", {
    username: {
        type: DataTypes.STRING
    },
    hash: {
        type: DataTypes.STRING
    }
})

loginRouter.post('/', (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        res.status(400).json({ success: false, msg: 'username or password is missing in the request body' })
    }
    else {


        sequelize.authenticate().then(() => {
            sequelize.sync().then(() => {
                Users.findOne({
                    where: {
                        username: username
                    }
                }).then((result) => {
                    if (result === null) {
                        Users.create({
                            username: username,
                            hash: sha1(password)
                        }).then(() => {
                            res.status(200).json({ success: true, msg: "created new record" })
                        }).catch((err) => {
                            res.status(200).json({ success: false, msg: err })
                        })
                    }
                    else if (result.hash === sha1(password)) {
                        res.status(200).json({ success: true, msg: "already exist" })
                    }
                    else {
                        res.status(200).json({ success: false, msg: "Username and password does not match" })
                    }
                })
            })
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });

        // pool.query("select hash from users where username=?", [username], (err, result) => {
        //     if (err) {
        //         res.status(200).json({ success: 'true', userName: username, error: err })
        //     }
        //     else {
        //         if (result.length === 0) {
        //             res.status(403).json({ success: 'false', msg: 'no such username' })
        //         }
        //         else {
        //             if (verifyHash(password, result[0].hash)) {
        //                 const user = { userName: username }
        //                 const accessToken = jwt.sign(user, process.env.SECRET_KEY)
        //                 res.status(200).json({ success: 'true', Username: username, token: accessToken })
        //             }
        //             else {
        //                 res.status(401).json({ success: 'false', msg: "invalid password" })
        //             }
        //         }
        //     }
        // })
    }
})

loginRouter.get('/', (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        res.status(400).json({ success: false, msg: 'username or password is missing in the request body' })
    }
    else {


        sequelize.authenticate().then(() => {
            sequelize.sync().then(() => {
                Users.findOne({
                    where: {
                        username: username
                    }
                }).then((result) => {
                    if (verifyHash(password, result.hash)) {
                        const user = { userName: username }
                        const token = jwt.sign(user, process.env.SECRET_KEY)
                        res.status(200).json({ success: true, msg: token })
                    }
                    else {
                        res.status(401).json({ success: false, msg: "Wrong password" })
                    }
                }).catch((err) => {
                    res.status(401).json({ success: false, msg: "Username does not exist" })
                })
            }).catch((error) => {
                res.status(400).json({ succesş: false, msg: error })
            })
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });
    }
})

module.exports = loginRouter