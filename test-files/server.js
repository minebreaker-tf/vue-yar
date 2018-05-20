const express = require("express")

const app = express();

app.get("/api/user/:id", (request, response) => {

    const requestedId = request.params.id

    const body =
        requestedId == 1 ? { id: 1, name: "John" } :
            requestedId == 2 ? { id: 2, name: "Jack" } :
                null


    if (body) {
        response.json(body)
    } else {
        response.status(404)
        response.send("Not found")
    }
})

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html")
})

app.get("/sample.js", (request, response) => {
    response.sendFile(__dirname + "/sample.js")
})

app.listen(8000, () => {
    console.log("Listening...")
})
