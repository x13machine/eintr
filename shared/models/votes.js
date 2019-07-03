module.exports = (sequelize, DataTypes) => {
	return sequelize.define('votes', {
		ID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		article: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true
		},
		user: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		vote: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	}, {
		tableName: 'votes',
		indexes: [
			{
				unique: true,
				fields: ['user', 'article']
			}
		]
	});
};
