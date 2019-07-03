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
			allowNull: false
		},
		user: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		vote: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	}, {
		tableName: 'votes',
		indexes: [
			{
				name: 'user_article',
				fields: ['user', 'article'],
				unique: true
			}
		]
	});
};
