//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var app = express();

// Setting Base directory
app.use(bodyParser.json());

var jwt = require("jsonwebtoken");
var secret = "aabbcc@12345";

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

//Setting up server
 var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("Server now running on port", port);
 });

//Initiallising connection string
var dbConfig = {
    user:  "sa",
    password: "123123",
    server: "HUONGND",
    database: "StudentDB"
};
function auth(token){
	var tag = 0;
	jwt.verify(token, secret, function(err, decoded){
    if(err)
    {
		tag = 0;
		return tag;
    }
    else {			
      tag = 1;
	  return tag;
    }
  });
  
}
//Function to connect to database and execute query
var  executeQuery = function(res, query){	
	var conn = new sql.ConnectionPool(dbConfig);
	conn.connect(function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
			// create Request object
			var request = new sql.Request(conn);
			// query to the database
			request.query(query, function (err, recordset) {
				if (err) {
					console.log("Error while querying database :- " + err);
					res.send(err);
				}
				else {
					res.send(recordset);
				}
				conn.close();
			});
			
		}
	});		
}
//CHECK TOKEN
 app.post("/api/check", function(req , res){	 
	var token = req.body.token;	
	if(token == null||token == ''){
		res.status(401);
		res.json({
		"tag": 0,
		"token": ""
		});		
	}
	else{
		jwt.verify(token, secret, function(err, decoded){
		if(err)
		{			
			res.json({
			"tag": 0,
			"token": ""
			});		
		}
		else {			
			res.json({
			"tag": 1,
			"token": token
			});
		}
		});	
	}	
});

app.post("/api/login", function(req, res){
	var username = req.body.username;
  	var password = req.body.password;  
  	var query = "select * from userinfo where username = '" + username + "' and password = '" + password+ "'";
	var conn = new sql.ConnectionPool(dbConfig);	
	conn.connect(function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
			// create Request object
			var request = new sql.Request(conn);
			// query to the database
			request.query(query, function (err, result) {
				if (err) {
					console.log("Error while querying database :- " + err);
					res.send(err);
				}
				else {					
					if(result.recordsets[0].length > 0){
						var token = jwt.sign({
							username:  result.recordset[0].username,
							id : result.recordset[0].id
							}, secret , { expiresIn : 360 });
						res.json({
							"tag": 1,
							"key": token
						});
					}
					else{
						res.status(401);
						res.json({
						"status": 401,
						"message": "Invalid credentials"
						});
						return;
					}
					
				}
				conn.close();
			});
			
		}
	});		
});
app.get("/api/student", function(req , res){
	var token = req.header('Authorization');	
	if(token == null||token == ''){
		res.status(401);
		res.json({
		"status": 401,
		"message": "Invalid Token"
		});		
	}
	else{
		jwt.verify(token, secret, function(err, decoded){
		if(err)
		{
			res.status(400);
			res.json({
			"status": 400,
			"message": "Token Expired"
			});		
		}
		else {			
			var query = "select * from [students]";
			executeQuery (res, query);
		}
		});	
	}
	
});

//POST API
 app.post("/api/student", function(req , res){	 
	var token = req.body.token;	
	if(token == null||token == ''){
		res.status(401);
		res.json({
		"status": 401,
		"message": "Invalid Token"
		});		
	}
	else{
		jwt.verify(token, secret, function(err, decoded){
		if(err)
		{
			res.status(400);
			res.json({
			"status": 400,
			"message": "Token Expired"
			});		
		}
		else {			
			var query = "INSERT INTO [students] (studentid,studentname,address,age) VALUES ('" + req.body.StudentId + "',N'" + req.body.StudentName + "',N'" + req.body.Address + "'," + req.body.Age +")";
			executeQuery (res, query);
		}
		});	
	}	
});

//PUT API
 app.put("/api/student/:id", function(req , res){
	 var token = req.body.token;	
	if(token == null||token == ''){
		res.status(401);
		res.json({
		"status": 401,
		"message": "Invalid Token"
		});		
	}
	else{
		jwt.verify(token, secret, function(err, decoded){
		if(err)
		{
			res.status(400);
			res.json({
			"status": 400,
			"message": "Token Expired"
			});		
		}
		else {			
			var query = "UPDATE [students] SET studentname= N'" + req.body.StudentName  +  "' , address=  N'" + req.body.Address +  "' , age=  " + req.body.Age + "  WHERE studentid= " + req.params.id;
			executeQuery (res, query);
		}
		});	
	}
	
});

// DELETE API
 app.delete("/api/student/:id", function(req , res){
	var token = req.header('Authorization');
	console.log(token);
	if(token == null||token == ''){
		res.status(401);
		res.json({
		"status": 401,
		"message": "Invalid Token"
		});		
	}
	else{
		jwt.verify(token, secret, function(err, decoded){
		if(err)
		{
			res.status(400);
			res.json({
			"status": 400,
			"message": "Token Expired"
			});		
		}
		else {			
			var query = "DELETE FROM [students] WHERE studentid=" + req.params.id;
			executeQuery (res, query);
		}
		});	
	} 	
});