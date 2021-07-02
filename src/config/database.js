const oracledb = require("oracledb");

db = {
  user: "C##pharma1",
  password: "pharma1",
  connectString: "localhost:1521/xe",
};

async function Open(sql, binds, autoCommit) {
  let bd = await oracledb.getConnection(db);
  let result = await bd.execute(sql, binds, { autoCommit });
  bd.release();
  return result;
}

exports.Open = Open;
