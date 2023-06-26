// server.js
const express = require('express');
const { crawlData, getTheListings } = require('./getTheClass');
const app = express();
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 }); 
//The constant of options
const years = "v_year"
const department = "v_dept"
const career = "v_career"
const grade = "v_level"
const week = "v_week"
const language = "v_lang"
const emi = "v_emi"

wss.on('connection', async (ws) => {
  console.log("User connected");
  const allYears = await getTheListings(years);
  const allDepartment = await getTheListings(department)
  const allCareers = await getTheListings(career)
  const allGrades = await getTheListings(grade)
  const allWeeks = await getTheListings(week)
  const allLanguages = await getTheListings(language)
  const allEmiOptions = await getTheListings(emi)
  ws.send(JSON.stringify({ type: 'listingYears', data: allYears }));
  ws.send(JSON.stringify({ type: 'listingDepartments', data: allDepartment}))
  ws.send(JSON.stringify({ type: "listingCareers", data: allCareers}))
  ws.send(JSON.stringify({ type: "listingGrades", data: allGrades}))
  ws.send(JSON.stringify({ type: "listingWeek", data: allWeeks}))
  ws.send(JSON.stringify({ type: "listingLanguage", data: allLanguages}))
  ws.send(JSON.stringify({ type: "listingEmi", data: allEmiOptions}))
  ws.send(JSON.stringify({ type: "verified"}))
  ws.on('message', async (message) => {
    console.log(`Received: ${message}`);
    const parsedMessage = JSON.parse(message);
    const data = await crawlData(parsedMessage)
  
    if (data) {
      ws.send(JSON.stringify({ type: 'crawledData', data: data }));
    } else {
      ws.send(JSON.stringify({ type: 'crawledData', data: 'Not found' }));
    }
    
   
  });

  ws.on('close', () => {
    console.log("User disconnected");
  });
});
const cors = require('cors')
app.use(cors());
app.get('/', async(req, res) => {
  res.send(await crawlData({"系所":"U56"}))
})

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
