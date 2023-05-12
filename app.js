const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
///Con Db REs to Obj Res
const conDbResToObjRes = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};
///Returns a list of all players in the team
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
    *
    FROM
    cricket_team;`;
  const playersArray = await db.all(getPlayerQuery);

  response.send(playersArray.map((eachPlayer) => conDbResToObjRes(eachPlayer)));
});

///Returns a player based on a player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
  SELECT
  *
  FROM
   cricket_team
   WHERE
   player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(conDbResToObjRes(playerDetails));
});
///Creates a new player in the team
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const playersQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role) 
    VALUES
    ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(playersQuery);

  response.send("Player Added to Team");
});
///Update Player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
  UPDATE
  cricket_team
  SET
  player_name = '${playerName}',
  jersey_number =${jerseyNumber},
  role = '${role}'
  WHERE
  player_id =${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
///Delete player Details
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayerQuery = `
  DELETE
  FROM 
  cricket_team
    WHERE
    player_id = ${playerId};`;
  const deletedPlayer = await db.run(updatePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
