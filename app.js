const express = require('express')
const {open} = require('sqlite')
const app = express()
app.use(express.json())
const path = require('path')
const sqlite3 = require('sqlite3')
let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`server running at http://localhost:3000/`)
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

/* Get Players API */
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

/* Get post API */

app.post('/players/', async (request, response) => {
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails
  const addPlayersQuery = `
    INSERT INTO
    cricket_team (player_name,jersey_number,role)
    VALUES(${playerName},${jerseyNumber},${role});`

  const dbResponse = await db.run(addPlayersQuery)
  const playerId = dbResponse.lastID
  response.send({playerId: playerId})
  response.send('Player Added to Team')
})

/* Get a Player API */
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  select 
    *
  from
      cricket_team
  where
   player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  const {player_id, player_name, jersey_number, role} = player
  const dbResponse = {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  }
  response.send(dbResponse)
})

/* Update player API */
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE 
  cricket_team
  SET 
  player_name=${playerName},
  jersey_number=${jerseyNumber},
  role=${role}
  WHERE player_id=${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete Player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    delete
      from cricket_team
    where
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
