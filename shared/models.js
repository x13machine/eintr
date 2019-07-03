const Sequelize = require('sequelize');
console.log(config.db);
const sequelize = new Sequelize(config.db,Object.assign({
	logging: false
},config.dbConfig || {}));

const articles = require('./models/articles')(sequelize, Sequelize.DataTypes);
const images = require('./models/images')(sequelize, Sequelize.DataTypes);
const sources = require('./models/sources')(sequelize, Sequelize.DataTypes);
const users = require('./models/users')(sequelize, Sequelize.DataTypes);
const votes = require('./models/votes')(sequelize, Sequelize.DataTypes);

sequelize.sync();

module.exports = {
	Sequelize: Sequelize,
	sequelize: sequelize,
	op: Sequelize.Op,
	articles: articles,
	images: images,
	sources: sources,
	users: users,
	votes: votes
};