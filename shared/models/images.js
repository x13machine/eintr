module.exports = (sequelize, DataTypes) => {
	return sequelize.define('images', {
		ID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		hash: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		use: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		}
	}, {
		tableName: 'images'
	});
};
