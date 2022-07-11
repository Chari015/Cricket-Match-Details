const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Player Details Table
const convertDbObjectToResponseObject_1 = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

// Match Details Table
const convertDbObjectToResponseObject_2 = (dbObject_2) => {
  return {
    matchId: dbObject_2.match_id,
    match: dbObject_2.match,
    year: dbObject_2.year,
  };
};

// Player Match Score Table
const convertDbObjectToResponseObject_3 = (dbObject_3) => {
  return {
    playerMatchId: dbObject_3.player_match_id,
    playerId: dbObject_3.player_id,
    matchId: dbObject_3.match_id,
    score: dbObject_3.score,
    fours: dbObject_3.fours,
    sixes: dbObject_3.sixes,
  };
};

// API-1
app.get("/players/", async (request, response) => {
  const getAllPlayers = `
    SELECT * FROM  player_details`;
  const allPlayers = await database.all(getAllPlayers);
  response.send(
    allPlayers.map((eachPlayer) =>
      convertDbObjectToResponseObject_1(eachPlayer)
    )
  );
});

// API-2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const specificPlayer = `
    SELECT * FROM player_details
    WHERE player_id=${playerId}`;
  const uniquePlayer = await database.get(specificPlayer);
  response.send(convertDbObjectToResponseObject_1(uniquePlayer));
});

// API-3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayers = `
    UPDATE player_details 
    SET 
    player_name = '${playerName}'
    WHERE player_id = ${playerId}`;
  const newPlayer = await database.run(updatePlayers);
  response.send("Player Details Updated");
});

// API-4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetails = `
    SELECT * FROM match_details
    WHERE match_id = ${matchId}`;
  const specificMatch = await database.get(matchDetails);
  response.send(convertDbObjectToResponseObject_2(specificMatch));
});

// API-5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = `
    SELECT * FROM match_details
     NATURAL JOIN player_match_score 
    WHERE player_id = ${playerId}`;
  const requestPlayer = await database.all(playerDetails);
  response.send(
    requestPlayer.map((everyPlayer) =>
      convertDbObjectToResponseObject_2(everyPlayer)
    )
  );
});

// API-6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const specificDetails = `
    SELECT * FROM player_details
    NATURAL JOIN player_match_score
    WHERE match_id = ${matchId}`;
  const listOfPlayers = await database.all(specificDetails);
  response.send(
    listOfPlayers.map((eachPlayer) =>
      convertDbObjectToResponseObject_1(eachPlayer)
    )
  );
});

// API-7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatistics = `
    SELECT
        player_id AS playerId,
        player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE player_id = ${playerId};`;
  const allStatistics = await database.get(getStatistics);
  response.send(allStatistics);
});
module.exports = app;
