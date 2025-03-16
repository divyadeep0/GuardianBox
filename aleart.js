const express = require("express");
const app = express();

app.use(express.json());

app.post("/send_alert", (req, res) => {
    const { policeStation, location, video } = req.body;

    // Here, send the alert to the police database/system
    console.log(`Alert sent to ${policeStation}`);
    console.log(`Location: ${location.lat}, ${location.lng}`);
    console.log(`Video feed: ${video}`);

    res.json({ message: "Alert sent successfully" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
