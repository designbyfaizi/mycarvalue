import { DataSource, DataSourceOptions } from "typeorm";

var dbConfig = {
  synchronize:false,
  migrations:['migrations/*.js'],
};

switch(process.env.NODE_ENV){
  case 'development': Object.assign(dbConfig, {
    type:'sqlite',
    database:'db.sqlite',
    entities:["**/*.entity.js"],
  });
  break;
  case 'test': Object.assign(dbConfig, {
    type:'sqlite',
    database:'test.sqlite',
    entities:["**/*.entity.ts"],
    migrationsRun: true
  });
  break;
  case 'production': Object.assign(dbConfig, {
    type:'mysql',
    url:process.env.DATABASE_URL,
    migrationsRun: true,
    entities:['**/*.entity.js'],
    ssl:{
      rejectUnauthorized: false
    }
  })
    break;
  default:
    throw new Error('unknown environment')
}
export {dbConfig};
export default new DataSource(dbConfig as DataSourceOptions)
// module.exports = dbConfig;