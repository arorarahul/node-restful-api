/* 
	File containing the basic db connection containing three tables namely: todo, user, token
	Check the models folder for respective table js files
*/

var Sequelize = require("sequelize");

//creating a new sequelize database connection
var sequelize = new Sequelize(undefined, undefined, undefined,{
	'dialect': 'sqlite',
	'storage': __dirname + '/data/sqlite-database.sqlite'
});

var db = {};

db.todo = sequelize.import(__dirname + '/models/todos.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//defining relationship between user and todo. A user can have many todos
// A todo will always belong to a user
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;
