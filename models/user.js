var bcrypt = require("bcrypt");
var _ = require("underscore");
var jwt = require("jsonwebtoken");
var cryptojs = require("crypto-js");

module.exports = function(sequelize, DataTypes) {

	var user =  sequelize.define('user', {

		email: {
			type: DataTypes.STRING,
			unique: true,
			validate: {
				isEmail: true
			},
			allowNull: false
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 20]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}

	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			},
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			generateToken: function(type){

				if(!_.isString(type)){
					return undefined
				}

				try{
					var stringData = JSON.stringify({id: this.get('id'), type: type})
					var encryptedData = cryptojs.AES.encrypt(stringData,'nopassword').toString();
					var token = jwt.sign({
						token: encryptedData
					},'nopassword');

					return token;

				}catch(e){
					console.log(e)
					return undefined;
				}

			}
		},
		classMethods: {
			authenticate: function(data) {

				return new Promise(function(resolve, reject) {
					if (typeof data.email !== 'string' || typeof data.password !== 'string') {
						return reject();
					}

					user.findOne({
						where: {
							email: data.email
						}
					}).then(function(user) {

						if (user && bcrypt.compareSync(data.password, user.password_hash)) {
							resolve(user);
						} else {
							return reject();
						}

					}, function(e) {
						return reject();
					})
				});

			},
			findByToken: function(token){
				return new Promise(function(resolve, reject){

					try{
						var decodedJWT = jwt.verify(token, 'nopassword');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'nopassword');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function(user){

							if(user){
								resolve(user);
							}else{
								reject();
							}

						}, function(e){
							reject();
						})
					}catch(e){
						reject();
					}

				});
			}
		}

	});

	return user;

}