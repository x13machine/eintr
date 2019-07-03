module.exports = (sequelize, DataTypes) => {
	return sequelize.define('sources', {
		slug: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'news'
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		inuse: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		link: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		tableName: 'sources'
	});
};
