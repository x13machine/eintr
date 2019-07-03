module.exports = (sequelize, DataTypes) => {
	return sequelize.define('articles', {
		hash: {
			type: DataTypes.STRING,
			allowNull: false
		},
		ID: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		slug: {
			type: DataTypes.STRING,
			allowNull: false
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false
		},
		title: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		published: {
			type: DataTypes.DOUBLE,
			allowNull: true,
			defaultValue: '0'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		image: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		tweeted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	}, {
		tableName: 'articles'
	});
};
