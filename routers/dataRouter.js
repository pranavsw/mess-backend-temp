const express = require('express')
let dataRouter = express.Router()
const { sha1, verifyHash } = require('sha1-hash-and-verify')
const pool = require('../database')
let crypto = require('node:crypto')
const { time } = require('node:console')
const { Sequelize, DataTypes } = require('sequelize')

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

const Data = sequelize.define("data", {
    rollnumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    hashvalue: {
        type: DataTypes.STRING,
        allowNull: false
    }
})
//TODO use table name as variable


// dataRouter.get("/lastid", (req, res) => {
//     pool.query('select max(id) as id from datatable', (err, result) => {
//         if (err) {
//             res.status(400).json({ status: 'false', msg: err })
//         }
//         else {
//             const { id } = result[0]
//             res.status(200).json({ status: 'true', lastId: id })
//         }
//     })
// })

dataRouter.get("/lastid", (req, res) => {
    sequelize.authenticate().then(() => {
        sequelize.sync().then(() => {
            Data.max('id').then((result) => {
                res.status(200).json({ success: true, maxId: result })
            })
        })
    })
})

dataRouter.post("/", (req, res) => {
    const { rollnumber, timestamp } = req.body
    if (!rollnumber && !timestamp) {
        res.status(400).json({ success: false, msg: "Provide rollnumber and timestamp" })
    }
    else {
        sequelize.authenticate().then(() => {
            sequelize.sync().then(() => {
                let times = timestamp.toString()
                let time = times.slice(0, 10)
                let hour = times.slice(11, 13)
                if (hour < '12') {
                    time = time + "B"
                }
                else if (hour < '16') {
                    time = time + "L"
                }
                else if (hour < '18') {
                    time = time + 'S'
                }
                else {
                    time = time + "D"
                }
                const value = `${rollnumber}+${time}`
                let hash = sha1(value)
                Data.findOne({
                    where: {
                        hashvalue: hash
                    }
                }).then((result) => {
                    if (result === null) {
                        Data.create({
                            rollnumber: rollnumber,
                            timestamp: timestamp,
                            hashvalue: hash
                        }).then(() => {
                            res.status(200).json({ success: true, msg: "Created record" })
                        }).catch((err) => {
                            res.status(200).json({ success: true, msg: err })
                        })
                    }
                    else {
                        res.status(200).json({ success: true, msg: "already exist", roll: result.rollnumber })
                    }
                }).catch((err) => {
                    res.send(200).status({ success: false, msg: "error" })
                })
            })
        }).catch((err) => {
            res.status(500).json({ success: false, msg: "Not connected to database", error: err })
        })
    }
})

// dataRouter.post("/", (req, res) => {
//     const { rollnumber, timestamp } = req.body
//     //TODO check for hashing before updating into the table
//     if (!rollnumber && !timestamp) {
//         res.status(400).json({ success: "false", msg: "Provide rollnumber and timestamp" })
//     }
//     else {
//         let times = timestamp.toString()
//         let time = times.slice(0, 10)
//         let hour = times.slice(11, 13)
//         if (hour < '12') {
//             time = time + 'B'
//         }
//         else if (hour < '16') {
//             time = time + 'L'
//         }
//         else if (hour < '18') {
//             time = time + 'S'
//         }
//         else {
//             time = time + 'D'
//         }
//         const value = `${rollnumber}+${time}`
//         let hash = sha1(value)
//         pool.query('select hashvalue from datatable where hashvalue=?', [hash], (err, result) => {
//             if (err) {
//                 res.status(500).json({ status: "false", msg: err })
//             }
//             else {
//                 if (result.length === 0) {
//                     pool.query(`insert into datatable (rollnumber,timestamp,hashvalue) values (${rollnumber},'${timestamp}','${hash}')`, (err, result) => {
//                         if (err) {
//                             res.status(500).json({ success: "false", msg: err })
//                         }
//                         else {
//                             res.status(200).json({ success: 'true', msg: "added successfully" })
//                         }
//                     })
//                 }
//                 else {
//                     res.status(200).json({ status: 'true', msg: 'already exist' })
//                 }
//             }
//         })

//     }
// })


module.exports = dataRouter