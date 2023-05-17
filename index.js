const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./assets/uploads")
  },
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage: storage
})
const db = require("./connection");
const { URLSearchParams } = require('url');
const { error } = require('console');

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
app.get('/', function (req, res) {
  res.render("index.ejs");
});

app.get("/invalid", function (req, res) {
  res.render("invalid.ejs");
});

app.get('/events', function (req, res) {

  const q = `select * from events where catogery="Technical" and date > sysdate() `;
  db.query(q, (error, tec) => {
    if (error) throw error;
    else {
      const q = `select * from events where catogery="Cultural" `;
      console.log(q);
      db.query(q, (error, cul) => {
        if (error) throw error;
        else {
          const q = `select * from events where catogery="Sports" `;
          console.log(q);
          db.query(q, (error, spo) => {
            if (error) throw error;
            else {

              res.render("index-allevents.ejs", { tec, cul, spo })
            }
          })
        }
      })
    }
  })
});

app.get('/org/:id', function (req, res) {
  const id = req.params.id;
  console.log(id);
  // const q = `select * from organizers where orgid=${id}`;
  res.render("org-home.ejs", { id });
});

app.get('/org/:id/allevents', function (req, res) {
  const id = req.params.id;

  const q = `select * from events where orgid = ${id} `;
  console.log(q);
  db.query(q, (error, oev) => {
    if (error) throw error;
    if (oev.length == 0) {
      const result = [];

    }
    else {
      const que = `select * from events e join organizers o on e.orgid = o.orgid where e.orgid not like "${id}" order by e.orgid`;
      console.log(que);
      db.query(que, (error, result) => {
        if (error) throw error;


        res.render("org-allevents.ejs", { id, oev, result });
      })
    }
  }
  )
});

app.get('/org/:id/allevents/update', function (req, res) {
  const id = req.params.id;
  console.log(id);

  res.render("org-update.ejs", { id });
});

app.get('/org/:id/sch', function (req, res) {
  const id = req.params.id;
  const q = `select * from events where orgid = "${id}" order by eventid desc`;
  console.log(q);
  db.query(q, (error, result) => {

    if (error) throw error;
    res.render("org-schudule.ejs", { id, result });
  });
});

app.get("/user/:id/home", function (req, res) {
  const id = req.params.id;
  res.render("user-home.ejs", { id });
})
app.get("/fgporg", function (req, res) {
  res.render("fgporg.ejs");
});



app.get("/user/:id/allevents", function (req, res) {
  const id = req.params.id;

  const q = `select * from events where catogery="Technical" order by eventid`;
  console.log(q);
  db.query(q, (error, tec) => {
    if (error) throw error;
    else {
      const q = `select * from events where catogery="Cultural" order by eventid`;
      console.log(q);
      db.query(q, (error, cul) => {
        if (error) throw error;
        else {
          const q = `select * from events where catogery="Sports" order by eventid`;
          console.log(q);
          db.query(q, (error, spo) => {
            if (error) throw error;
            const q = `select * from enrollments e inner JOIN events eve on e.eventid = eve.eventid where userid="${id}" order by e.eventid`;
            console.log(q);
            db.query(q, (error, enrol) => {
              if (error) throw error;
              else {

                res.render("user-allevents.ejs", { tec, cul, spo, id, enrol })
              }
            })
          })
        }
      })
    }
  })
})

app.get("/user/:id/enrollments", function (req, res) {
  const id = req.params.id;
  const q = `select * from enrollments e join users u on e.userid = u.userid join events ev on ev.eventid = e.eventid where u.userid = ${id} `;
  const q1 = `select * from users where userid = ${id}`;
  db.query(q, (error, result) => {
    if (error)
      throw error;
    console.log(q);
    console.log(result);
    db.query(q1, (error, ans) => {
      if (error)
        throw error;
      res.render("user-enrollments.ejs", { id, result, ans });

    })
  })

});



app.post('/usersignup', function (req, res) {
  const data = req.body;

  const q = `insert into users values(null,"${data.username}","${data.password}","${data.mail}","${data.mobile}","${data.year}")`;
  console.log(q);
  db.query(q, (error, result) => {
    if (error) { res.send("user might already exit"); }

    res.redirect("/");
  })
});

app.post("/check",function(req,res){
  const data = req.body;
  console.log(data);
  if(data.given == data.ans)
    res.send("your password is " + data.password);
  else{
    res.send("incorrect");
  }
})

app.get("/fgporg/:id", function (req, res) {
  const id = req.params.id;
  const q = `select * from organizers o join questions q on q.qno = o.qno where o.orgid = ${id}`;
  console.log(req.params);
  db.query(q, (error, result) => {
    if (error) throw error;
    res.render("fgporgque.ejs",{result});
  })
});


app.post("/fgporg", function (req, res) {
  const data = req.body;
  const q = `select * from organizers o join questions q on q.qno = o.qno where o.orgname="${data.orgname}"`;
  db.query(q, (error, result) => {
    if (error) throw error;
    console.log(result);
    res.redirect(`/fgporg/${result[0].orgid}`);
  })
});

app.post("/user/:id/register", function (req, res) {

  const data = req.body;
  const id = data.userid;
  const q = `insert into enrollments values(${data.userid},${data.eventid})`;
  console.log(q);
  db.query(q, (error, result) => {
    if (error) throw error;
    res.redirect(`/user/${id}/allevents`)
  })

});

app.post("/user/:id/cancel", function (req, res) {

  const id = req.params.id;
  const data = req.body;
  const q = `delete from enrollments where eventid = ${data.eventid} and userid=${data.userid}`;
  console.log(q);
  db.query(q, (error, result) => {
    if (error) throw error;
    res.redirect(`/user/${id}/allevents`);
  })
});

app.post('/usersignin', function (req, res) {
  const data = req.body;

  const q = `select userid from users where mail="${data.mail}" and password="${data.password}"`;

  console.log(q);
  db.query(q, (error, result) => {
    if (error) throw error;
    if (result.length == 1) {

      const id = result[0].userid;
      res.redirect(`/user/${id}/home`);
    }
    else {
      res.send("invalid credentials");
    }
  })
});

app.post('/orglogin', function (req, res) {

  const data = req.body;
  const q = `select * from organizers where orgname="${data.orgname}" and password="${data.password}" `;
  db.query(q, (error, results) => {
    if (error) res.send(error);
    else {
      if (results.length == 1) {
        res.redirect(`/org/${results[0].orgid}`);
        console.log(results);
      }
      else {
        // res.send("Invalid username or password");
        res.redirect("/invalid");
      }
    }
  })
});

app.post('/org/delete', function (req, res) {
  const eventid = req.body.eventid;
  const q = `delete from events where eventid=${eventid} `;
  console.log(q);
  db.query(q, (error, result) => {
    if (error) throw error;
    else {
      // res.send("done");
      // res.render("/org/eventid/allevents");
    }
  })
});

app.post('/org/sch', upload.single('poster'), function (req, res) {
  const orgid = req.params.id;

  const data = req.body;
  if (data.rno == '')
    data.rno = 'null';
  const q = `insert into events values("${data.eventid}",${data.orgid},"${data.programme}","${data.catogery}","${data.events}",${data.contact},"${data.loc}",${data.rno},"${data.date}","${data.time}","${data.rewards}","${data.des}","${req.file.filename}" ) `;
  db.query(q, (error, results) => {
    console.log(q);
    if (error) res.send(error);
    else {
      if (results.length) {

      }
      else {
        res.send("Upload Sucess");
      }
    }
  })
});

app.post('/org/upevent', upload.single('poster'), function (req, res) {
  const orgid = req.params.id;
  const data = req.body;
  if (data.rno == '')
    data.rno = 'null';
  const q = `update events set eventid="${data.eventid}",programme = "${data.programme}",catogery = "${data.catogery}",events = "${data.events}",contact = ${data.contact},loc = "${data.loc}",rno = ${data.rno},date = "${data.date}",time = "${data.time}",rewards = "${data.rewards}",poster = "${req.file.filename}",des = "${data.des}" WHERE  eventid = ${data.eventid}`;
  db.query(q, (error, results) => {
    console.log(q);
    if (error) res.send(error);
    else {
      if (results.length) {
        console.log(results);
      }
      else {
        res.send("Update Sucess");
      }
    }
  })
});

// Start the server
app.listen(3000, function () {
  console.log('Server started on port 3000');
});