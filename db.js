var Sequelize = require("sequelize");

var sequelize = new Sequelize(undefined, undefined, undefined,{
	'dialect': 'sqlite',
	'storage': __dirname + '/data/sqlite-database.sqlite'
});

// var sequelize = new Sequelize('todolist', 'rahul', 'nopassword',{
// 	'dialect': 'postgres',
// 	'storage': __dirname + '/data/sqlite-database.sqlite'
// });

var db = {};

db.todo = sequelize.import(__dirname + '/models/todos.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;