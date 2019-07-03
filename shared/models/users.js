module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		ID: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'email'
		},
		google: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: 'google'
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		tableName: 'users'
	},);
};
