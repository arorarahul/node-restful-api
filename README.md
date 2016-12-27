#Node, Express and Sequelize Rest-API boiler plate with database

This is a straight forward boiler plate to build Rest API with express and sequelize to connect and fetch data from sqlite database.
It also contains token based user authentication

#### Third party node package managers used

* [bcrypt](https://www.npmjs.com/package/bcrypt) to support password hashing for user authentication
* Body parsing via [body-parser](https://www.npmjs.com/package/body-parser)
* [cypto-js](https://www.npmjs.com/package/crypto-js) and [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) to support token based authentication
* [sqlite3](https://www.npmjs.com/package/sqlite3) and [sequelize](http://docs.sequelizejs.com/en/v3/) to support database integration

## Getting started

```javascript
//git clone
git clone https://github.com/arorarahul/node-restful-api.git

//move to the required directory
cd node-restful-api

//install all the dependencies 
npm install
```

### How ro run?

```javascript
//start server and build database schema
node server.js

//use postman or any other tool to access APIs namely

//create user by passing 'email' and 'password' in json format
POST localhost:3000/users

//login user by passing 'email' and 'password' for created user. Save the auth token returned in the remaining
//get, post and put calls
POST localhost:3000/users/login

//Pass auth token returned above as header in this call
//create todos by passing 'description' and 'completed' (boolean) in this call as JSON
POST localhost:3000/todos
```
