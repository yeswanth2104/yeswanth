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

//GET A PLAYER

app.get("/players/", async (request, response) => {
  const getPlayersList = `select * from cricket_team order by player_Id;
    `;

  const playersList = await db.all(getPlayersList);
  response.send(playersList);
});

//POST PLAYER API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { player_name, jersey_number, role } = playerDetails;

  const addPlayerDetails = `
        INSERT INTO 
        cricket_team (player_name,jersey_number,role)
        VALUES(
            '${player_name}',
             ${jersey_number},
            '${role}'
                );
    `;
  const dbResponse = await db.run(addPlayerDetails);
  const playerId = dbResponse.lastID;
  response.send({ playerId: playerId });
});
