const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./assets/uploads");
  },
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({
  storage: storage,
});
const db = require("./connection");
const { URLSearchParams } = require("url");
const { error } = require("console");

db.connect((error) => {
  if (error) throw error;
  console.log("CONNECTED SUCCESSFULLY TO DATABASE");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "assets")));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

// Define a route for the root URL
app.get("/", function (req, res) {
  res.render("index.ejs");
});
app.get("/invalid", function (req, res) {
  res.render("invalid.ejs");
});
app.get("/events", async (req, res) => {
  try {
    // Technical events (future)
    const tecQuery = `SELECT * FROM events WHERE catogery = $1 AND date > CURRENT_DATE`;
    const tecResult = await db.query(tecQuery, ["Technical"]);

    // Cultural events
    const culQuery = `SELECT * FROM events WHERE catogery = $1`;
    const culResult = await db.query(culQuery, ["Cultural"]);

    // Sports events
    const spoQuery = `SELECT * FROM events WHERE catogery = $1`;
    const spoResult = await db.query(spoQuery, ["Sports"]);

    // Render page with results
    res.render("index-allevents.ejs", {
      tec: tecResult.rows,
      cul: culResult.rows,
      spo: spoResult.rows,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Internal server error");
  }
});

app.get("/org/:id", async function (req, res) {
  const id = req.params.id;

  try {
    const query = `SELECT * FROM organizers WHERE orgid = $1`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("Organizer not found");
    }

    res.render("org-home.ejs", { id: result.rows[0].orgid });
  } catch (err) {
    console.error("Error fetching organizer:", err);
    res.status(500).send("Internal server error");
  }
});

app.get("/org/:id/allevents", async function (req, res) {
  const id = req.params.id;

  try {
    // Get events created by this organizer
    const oevQuery = `SELECT * FROM events WHERE orgid = $1`;
    const oevResult = await db.query(oevQuery, [id]);

    // If no events, send empty result array
    if (oevResult.rows.length === 0) {
      return res.render("org-allevents.ejs", { id, oev: [], result: [] });
    }

    // Get all events NOT created by this organizer (joined with organizer info)
    const otherQuery = `
      SELECT * FROM events e 
      JOIN organizers o ON e.orgid = o.orgid 
      WHERE e.orgid != $1 
      ORDER BY e.orgid
    `;
    const otherResult = await db.query(otherQuery, [id]);

    res.render("org-allevents.ejs", {
      id,
      oev: oevResult.rows,
      result: otherResult.rows,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Internal server error");
  }
});

app.get("/org/:id/allevents/update", async function (req, res) {
  const id = req.params.id;

  try {
    res.render("org-update.ejs", { id });
  } catch (err) {
    console.error("Error rendering update page:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/org/:id/sch", async function (req, res) {
  const id = req.params.id;

  try {
    const query = `SELECT * FROM events WHERE orgid = $1 ORDER BY eventid DESC`;
    const result = await db.query(query, [id]);
    // console.log(result.rows);
    res.render("org-schudule.ejs", {
      id,
      result: result.rows,
    });
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user/:id/home", async function (req, res) {
  const id = req.params.id;

  try {
    res.render("user-home.ejs", { id });
  } catch (err) {
    console.error("Error rendering user home page:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/fgporg", function (req, res) {
  res.render("fgporg.ejs");
});

app.get("/user/:id/allevents", async function (req, res) {
  const id = req.params.id;

  try {
    // Query all three categories in parallel
    const [tecResult, culResult, spoResult] = await Promise.all([
      db.query(`SELECT * FROM events WHERE catogery = $1 ORDER BY eventid`, [
        "Technical",
      ]),
      db.query(`SELECT * FROM events WHERE catogery = $1 ORDER BY eventid`, [
        "Cultural",
      ]),
      db.query(`SELECT * FROM events WHERE catogery = $1 ORDER BY eventid`, [
        "Sports",
      ]),
    ]);

    // Query user's enrolled events
    const enrolQuery = `
      SELECT * 
      FROM enrollments e 
      INNER JOIN events eve ON e.eventid = eve.eventid 
      WHERE e.userid = $1 
      ORDER BY e.eventid
    `;
    const enrolResult = await db.query(enrolQuery, [id]);

    // Render view
    res.render("user-allevents.ejs", {
      id,
      tec: tecResult.rows,
      cul: culResult.rows,
      spo: spoResult.rows,
      enrol: enrolResult.rows,
    });
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user/:id/enrollments", async function (req, res) {
  const id = req.params.id;

  try {
    // 1. Fetch all enrollments for the user, joining users and events
    const enrollmentsQuery = `
      SELECT * 
      FROM enrollments e
      JOIN users u ON e.userid = u.userid
      JOIN events ev ON ev.eventid = e.eventid
      WHERE u.userid = $1
    `;
    const enrollmentsResult = await db.query(enrollmentsQuery, [id]);

    // 2. Fetch user details
    const userQuery = `SELECT * FROM users WHERE userid = $1`;
    const userResult = await db.query(userQuery, [id]);

    // 3. Render the template
    res.render("user-enrollments.ejs", {
      id,
      result: enrollmentsResult.rows,
      ans: userResult.rows,
    });
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/usersignup", async function (req, res) {
  const data = req.body;

  const insertQuery = `
    INSERT INTO users (username, password, mail, mobile, year)
    VALUES ($1, $2, $3, $4, $5)
  `;

  const values = [
    data.username,
    data.password,
    data.mail,
    data.mobile,
    data.year,
  ];

  try {
    await db.query(insertQuery, values);
    res.redirect("/");
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === "23505") {
      // Unique violation
      res.send("User might already exist.");
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

app.post("/check", function (req, res) {
  const data = req.body;
  // console.log(data);
  if (data.given == data.ans) res.send("your password is " + data.password);
  else {
    res.send("incorrect");
  }
});

app.get("/fgporg/:id", async function (req, res) {
  const id = req.params.id;

  try {
    const query = `
      SELECT * 
      FROM organizers o 
      JOIN questions q ON q.qno = o.qno 
      WHERE o.orgid = $1
    `;

    const result = await db.query(query, [id]);

    res.render("fgporgque.ejs", {
      result: result.rows,
    });
  } catch (error) {
    console.error("Error fetching organizer question:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/fgporg", async function (req, res) {
  const data = req.body;
  try {
    const query = `
      SELECT * FROM organizers o 
      JOIN questions q ON q.qno = o.qno 
      WHERE o.orgname = $1`;
    const result = await db.query(query, [data.orgname]);
    res.redirect(`/fgporg/${result.rows[0].orgid}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/user/:id/register", async function (req, res) {
  const { userid, eventid } = req.body;
  try {
    await db.query(
      "INSERT INTO enrollments (userid, eventid) VALUES ($1, $2)",
      [userid, eventid]
    );
    res.redirect(`/user/${userid}/allevents`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/user/:id/cancel", async function (req, res) {
  const { userid, eventid } = req.body;
  try {
    await db.query(
      "DELETE FROM enrollments WHERE eventid = $1 AND userid = $2",
      [eventid, userid]
    );
    res.redirect(`/user/${userid}/allevents`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/usersignin", async function (req, res) {
  const { mail, password } = req.body;
  try {
    const result = await db.query(
      "SELECT userid FROM users WHERE mail = $1 AND password = $2",
      [mail, password]
    );
    if (result.rows.length === 1) {
      res.redirect(`/user/${result.rows[0].userid}/home`);
    } else {
      res.send("invalid credentials");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/orglogin", async function (req, res) {
  const { orgname, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM organizers WHERE orgname = $1 AND password = $2",
      [orgname, password]
    );
    if (result.rows.length === 1) {
      res.redirect(`/org/${result.rows[0].orgid}`);
    } else {
      res.redirect("/invalid");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/org/delete", async function (req, res) {
  const { eventid } = req.body;
  try {
    await db.query("DELETE FROM events WHERE eventid = $1", [eventid]);
    res.send("Deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/org/sch", upload.single("poster"), async function (req, res) {
  const data = req.body;
  // console.log(data.eventid);
  const poster = req.file?.filename || null;
  try {
    await db.query(
      `INSERT INTO events (eventid, orgid, programme, catogery, events, contact, loc, rno, date, time, rewards, des, poster)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        data.eventid,
        data.orgid,
        data.programme,
        data.catogery,
        data.events,
        data.contact,
        data.loc,
        data.rno || null,
        data.date,
        data.time,
        data.rewards,
        data.des,
        poster,
      ]
    );
    res.send("Upload Success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/org/upevent", upload.single("poster"), async function (req, res) {
  const data = req.body;
  const poster = req.file?.filename || null;
  try {
    await db.query(
      `UPDATE events SET
         programme = $1,
         catogery = $2,
         events = $3,
         contact = $4,
         loc = $5,
         rno = $6,
         date = $7,
         time = $8,
         rewards = $9,
         poster = $10,
         des = $11
       WHERE eventid = $12`,
      [
        data.programme,
        data.catogery,
        data.events,
        data.contact,
        data.loc,
        data.rno || null,
        data.date,
        data.time,
        data.rewards,
        poster,
        data.des,
        data.eventid,
      ]
    );
    res.send("Update Success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
