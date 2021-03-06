/* 
	Table name 'todo' containing two columns description and completed
*/

module.exports = function(sequelize, DataTypes) {

	return sequelize.define('todo', {
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 250]
			}
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			validate: {
				isBoolean: function(val) {
					if (typeof val !== "boolean") {
						throw new Error('Not boolean.');
					}
				}
			}
		}
	})

};