const express = require('express');
const app = express();
const DatabaseProcessor = require("./adpater/DatabaseProcessor");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const databaseProcessor = new DatabaseProcessor();

const morgan = require('morgan')
const PORT = 3000;

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))


//MiddleWare
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    res.append("Access-Control-Allow-Credentials", true);
    next()
})

// Route
app.get('/user/all', async (req, res) => {
    const result = await databaseProcessor.getUserList()
    res.json({"data": result.data})
})

app.post('/user/new', async (req, res) => {
    await databaseProcessor.insertNewUser(req.body)
    res.send(200)
})

app.get('/user/check/:email/:password', async (req, res) => {
    const email = req.params.email
    const password = req.params.password
    let hash = await databaseProcessor.checkUserInfo(email, password)
    res.status(200).json({
        "data": [
            {
                check: hash
            }
        ]
    })
})

app.get('/parking/slot/:field/available', async (req, res) => {
    const field = req.params.field
    const result = await databaseProcessor.get_available_slot(field)
    res.status(200).json({
        "data": result.data
    })
})

app.get("/parking/field", async (req, res) => {
    const result = await databaseProcessor.get_field()
    res.json({
        "data": result.data
    })
})

app.post("/preserve", (req, res) => {
    console.log(req.body)
    res.status(200).json({
        "data": [
            {
                "isPreserved": true,
                "parking_place": "A001",
                "start_time": "2023-02-10 00:30:00",
                "end_time": "2023-02-10 04:30:00"
            }
        ],
        "debug": req.body
    })
})

app.get("/user/:userID/car", async (req, res) => {
    const userID = req.params.userID
    const result = await databaseProcessor.get_cars_by_id(userID)
    res.json({
        "data": result.data
    })
})

app.post("/user/:userID/:plate", async (req, res) => {
    const userID = req.params.userID
    const plate = req.params.plate
    await fetch(`http://127.0.0.1:5000/user/${userID}/car/${plate}`, {method: "POST"})
    res.send(200)
})


app.get("/user/search/:account", async (req, res) => {
    const account = req.params.account
    const result = await fetch(`http://127.0.0.1:5000/user/search/${account}`)
        .then(result => {
            return result.json()
        })
    res.status(200).json({
        "data": result.data
    })
})

app.get("/user/:email/userID", async (req, res) => {
    const email = req.params.email
    const result = await fetch(`http://127.0.0.1:5000/user/${email}/userid`)
        .then(result => {
            return result.json()
        })
    res.status(200).json({
        "data": result.data
    })
})

app.get("/parking/slot/current", async (req, res) => {
    const result = await fetch(`http://127.0.0.1:5000/parking/slot`, {method: "GET"})
        .then(result => {
            return result.json()
        })
    res.status(200).json({
        "data": result.data
    })
})

app.post("/entry", async (req, res) => {
    try {
        await databaseProcessor.car_entry(req.body)
        res.send(200)
    } catch (err) {
        res.send(400)
    }
})

app.post("/exit", async (req, res) => {
    try {
        await databaseProcessor.car_exit(req.body)
        res.send(200)
    } catch (err) {
        console.log(err)
        res.send(400)
    }
})

app.post("/reserve", async (req, res) => {
    try {
        await databaseProcessor.reserve(req.body)
        res.send(200)
    } catch (err) {
        res.send(400)
    }
})

app.get("/black", async (req, res) => {
    try {
        const result = await fetch(`http://127.0.0.1:5000/black`, {method: "GET"})
            .then(result => {
                return result.json()
            })
        res.status(200).json({
            "data": result.data
        })
    } catch (err) {
        res.send(404)
    }
})

app.get("/parking/history/:field/:number", async (req, res) => {
    const field = req.params.field
    const number = req.params.number
    try {
        const result = await fetch(`http://127.0.0.1:5000/parking/history/${field}/${number}`, {method: "GET"})
            .then(result => {
                return result.json()
            })
        res.status(200).json({
            "data": result.data
        })
    } catch (err) {
        res.send(400)
    }
})

// Find Slot

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})