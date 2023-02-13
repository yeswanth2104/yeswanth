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
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const snakeToCamel = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  };
};

//GET ALL PLAYER API-1

app.get("/players/", async (request, response) => {
  const getPlayersList = `select * from cricket_team order by player_id;
    `;

  const playersList = await db.all(getPlayersList);
  const playersNew = playersList.map((each) => snakeToCamel(each));
  response.send(playersNew);
});

//POST PLAYER API-2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerDetails = `
        INSERT INTO 
        cricket_team (player_name,jersey_number,role)
        VALUES(
            '${playerName}',
             ${jerseyNumber},
            '${role}'
                );
    `;
  const dbResponse = await db.run(addPlayerDetails);
  const playerId = dbResponse.lastID;
  response.send({ playerId: playerId });
});

//GET A PLAYER API-3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerList = `select * 
    from cricket_team 
    where player_id = ${playerId}`;

  const player = await db.get(getPlayerList);
  //const playersNew = player.map((each) => snakeToCamel(each));
  response.send(player);
});

//PUT A PLAYER API-4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
            UPDATE 
                cricket_team 
            SET
                player_name='${playerName}',
                jersey_number=${jerseyNumber},
                role='${role}'
                
            WHERE 
            player_id = ${playerId};

            `;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//DELETE A PLAYER API-5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerList = `DELETE FROM
         cricket_team
    WHERE 
        player_id = ${playerId};     
    `;
  await db.run(deletePlayerList);
  response.send("Player Removed");
});
