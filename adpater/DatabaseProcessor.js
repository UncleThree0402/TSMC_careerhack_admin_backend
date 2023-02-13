const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class DatabaseProcessor {
    constructor() {

    }

    async getUserList() {
        const res = await fetch("http://127.0.0.1:5000/user/all", {
            method: "GET"
        })
        return await res.json()
    }

    async insertNewUser(data) {
        const res = await fetch("http://127.0.0.1:5000/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        return res;
    }

    async checkUserInfo(email, password) {
        const res = await fetch(`http://127.0.0.1:5000/user/${email}/check`, {
            method: "GET"
        })
        let isExist = await res.json()
        console.log(isExist)
        isExist = isExist.data[0].exist

        if (isExist) {
            const res2 = await fetch(`http://127.0.0.1:5000/user/${email}/password`, {
                method: "GET"
            })

            let realPassword = await res2.json()
            realPassword = realPassword.data[0].exist

            if (realPassword === password) {
                return {"exist": true, "password": true}
            } else {
                return {"exist": true, "password": false}
            }
        } else {
            return {"exist": false, "password": false}
        }
    }

    async get_available_slot(field) {
        const res = await fetch(`http://127.0.0.1:5000/parking/slot/${field}/available`, {
            method: "GET"
        })
        return await res.json()
    }

    async get_field() {
        const res = await fetch("http://127.0.0.1:5000/parking/field", {
            method: "GET"
        })
        return await res.json()
    }

    async get_cars_by_id(id) {
        const res = await fetch(`http://127.0.0.1:5000/user/${id}/car`, {
            method: "GET"
        })
        return await res.json()
    }

    async car_entry(json_input) {
        const parkingLotName = json_input["data"][0]["parkingLotName"]
        const parkingNumber = json_input["data"][0]["parkingNumber"]
        const licensePlate = json_input["data"][0]["licensePlate"]
        const parkingStartTime = json_input["data"][0]["parkingStartTime"]

        console.log(json_input)

        const minus = await fetch(`http://127.0.0.1:5000/parking/field/in/${parkingLotName}`, {method: "PATCH"})
        const insert = await fetch("http://127.0.0.1:5000/parking/history", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "data": [
                    {
                        "parkingLotName": parkingLotName,
                        "parkingNumber": parkingNumber,
                        "licensePlate": licensePlate,
                        "parkingStartTime": parkingStartTime,
                        "parkingEndTime": ""
                    }
                ]
            })
        })
        const update = await fetch("http://127.0.0.1:5000/parking/slot", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "data": [
                    {
                        "parkingLotName": parkingLotName,
                        "parkingNumber": parkingNumber,
                        "licensePlate": licensePlate
                    }
                ]
            })
        })
    }

    async car_exit(json_input) {
        const parkingLotName = json_input["data"][0]["parkingLotName"]
        const parkingNumber = json_input["data"][0]["parkingNumber"]
        const licensePlate = json_input["data"][0]["licensePlate"]
        const parkingEndTime = json_input["data"][0]["parkingExitTime"]

        await fetch(`http://127.0.0.1:5000/parking/field/out/${parkingLotName}`, {method: "PATCH"})
        await fetch("http://127.0.0.1:5000/parking/history", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "data": [
                    {
                        "licensePlate": licensePlate,
                        "parkingEndTime": parkingEndTime
                    }
                ]
            })
        })
        const check = await fetch(`http://127.0.0.1:5000/check/${licensePlate}`).then(result => result.json())
        await fetch("http://127.0.0.1:5000/parking/slot", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "data": [
                    {
                        "parkingLotName": parkingLotName,
                        "parkingNumber": parkingNumber,
                        "licensePlate": ""
                    }
                ]
            })
        })


        if (check.data[0]["one"] || check.data[0]["two"] || check.data[0]["three"]) {
            let exactDateTimestamp = new Date(parkingEndTime).getTime();
            exactDateTimestamp += (3600 * 1000 * 24)
            let dateFormat = new Date(exactDateTimestamp);
            let ans = "" + dateFormat.getFullYear() + "-" + dateFormat.getMonth() + "-" + dateFormat.getDay()
            const result = await fetch("http://127.0.0.1:5000/black", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "data": [
                        {
                            "licensePlate": licensePlate,
                            "blackStartTime": parkingEndTime,
                            "blackEndTime": parkingEndTime
                        }
                    ]
                })
            })

            console.log(result.status)
        }


    }

    async reserve(data) {
        const licensePlate = data["data"][0]["licensePlate"]
        const reservationStartTime = data["data"][0]["reservationStartTime"]
        const reservationEndTime = data["data"][0]["reservationEndTime"]
        const reservationName = data["data"][0]["reservationName"]
        const reservationNumber = data["data"][0]["reservationNumber"]

        await fetch("http://127.0.0.1:5000/reserve", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "data": [
                    {
                        "licensePlate": licensePlate,
                        "reservationStartTime": reservationStartTime,
                        "reservationEndTime": reservationEndTime,
                        "reservationName": reservationName,
                        "reservationNumber": reservationNumber
                    }
                ]
            })
        })
    }

}

module.exports = DatabaseProcessor

