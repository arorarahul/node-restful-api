var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db");

var bcrypt = require("bcrypt");

var middleware = require("./middleware")(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
app.use(bodyParser.json());

app.get('/', function(req,res){

	res.send("TODO API")

})

app.get('/todos', middleware.requireAuthentication, function(req,res){

	var queryParams = req.query;

	var where = {
		userId: req.user.get('id')
	};

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){

		where.completed = true;

	}else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){

		where.completed = false;

	}

	if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0){

		where.description = {
			$like:'%'+queryParams.q+'%'
		}

	}else if(queryParams.hasOwnProperty('q')){

		res.status(400).json({'error':'description length should not be zero'})
	}

	db.todo.findAll({where:where}).then(function(todos){

		res.json(todos);

	}, function(e){
		res.status(500).send();
	})

});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res){

	var todosId = parseInt(req.params.id);

	if(isNaN(todosId) || typeof todosId !== 'number'){
		return res.status(400).json({'error':'given id should be a numeral'})
	}

	var where = {
		userId: req.user.get('id'),
		id: todosId
	}

	var todo = db.todo.findOne({where: where}).then(function(todo){

		if(todo){
			res.json(todo.toJSON());
		}else{
			res.status(404).send();
		}

	}, function(e){
		res.status(500).json(e);
	})

});

app.post("/todos", middleware.requireAuthentication, function(req, res){

	var data = _.pick(req.body, 'description','completed');

	data.description = data.description.trim();

	db.todo.create(data).then(function(todo){
		console.log(req.user);
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			res.json(todo.toJSON());	
		})
	}, function(e){
		res.status(500).json(e);
	})

});

app.put("/todos/:id", middleware.requireAuthentication, function(req, res){

	var todoId = parseInt(req.params.id, 10);

	var data = _.pick(req.body,'description','completed');

	var updatedData = {};

	if(data.hasOwnProperty('completed') && _.isBoolean(data.completed)){
		updatedData.completed = data.completed;
	}

	if(data.hasOwnProperty('description')){
		updatedData.description = data.description;
	}

	var where = {
		userId: req.user.get('id'),
		id: todoId
	}

	db.todo.findOne({where: where}).then(function(todo){

		if(todo){

			todo.update(updatedData).then(function(todo){
				res.json(todo);
			}, function(e){
				res.json(400).json(e);
			})

		}else{
			res.status(404).send("todo not found")
		}	

	}, function(e){
		res.status(500).json(e);
	})

});

app.delete("/todos/:id", middleware.requireAuthentication, function(req, res){

	var todosId = parseInt(req.params.id);

	if(isNaN(todosId) || typeof todosId !== 'number'){
		return res.status(400).json({'error':'given id should be a numeral'})
	}

	var where = {
		userId: req.user.get('id')
	};

	where.id = todosId;

	db.todo.destroy({where:where}).then(function(rowsDeleted){
		if(rowsDeleted){
			res.status(204).send();
		}else{
			res.status(404).send();
		}
		

	}, function(e){
		res.status(500).json(e);
	})

});

app.post('/users/login', function(req, res){

	var data = _.pick(req.body,'email','password');

	var userInstance;

	db.user.authenticate(data).then(function(user){
		
		var token = user.generateToken('authenticate');
		userInstance = user;
		return db.token.create({
			token: token
		});

	}).then(function(token){
		res.header('Auth',token.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e){
		res.status(401).send();
	})

});

app.post('/users', function(req, res){

	var data = _.pick(req.body, 'email','password');
  	
	db.user.create(data).then(function(user){
		res.json(user.toPublicJSON());
	}, function(e){
		res.status(400).json(e);
	})

});


//for logging out users
app.delete('/users/login', middleware.requireAuthentication, function(req, res){

	req.token.destroy().then(function(){
		res.status(204).send();
	}, function(e){
		res.status(500).send();
	})

})

db.sequelize.sync().then(function(){
	
	app.listen(PORT, function(){
		console.log("Server successfully running on port" + PORT);
	});	

})

