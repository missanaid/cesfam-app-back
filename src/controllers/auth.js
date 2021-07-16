const { response } = require("express");
const { generarJWT } = require("../helpers/generar-jwt");
const BD = require("../config/database");
const pbkdf2 = require("pbkdf2");

const login = async (req, res = response) => {
  const { user, password } = req.body;

  try {
    const sql = `select username, password, id from database_user where username='${user}'`;
    let result = await BD.Open(sql, [], false);
    const usuario = [result.rows[0][0], result.rows[0][1], result.rows[0][2]];

    if (!usuario) {
      return res.status(400).json({
        usuario: { ok: false, msg: "Error, usuario o contraseña incorrectos" },
      });
    }

    if (result.rows.length < 1) {
      return res.status(400).json({
        usuario: { ok: false, msg: "Error, usuario o contraseña incorrectos." },
      });
    }

    const passwordDb = result.rows[0][1];
    let validatePassword = function (key, string) {
      let parts = string.split("$");
      let iterations = parts[1];
      let salt = parts[2];
      const hashPassword = pbkdf2
        .pbkdf2Sync(key, Buffer.from(salt), Number(iterations), 32, "sha256")
        .toString("base64");
      return hashPassword === parts[3];
    };
    const match = validatePassword(password, passwordDb);

    if (!match) {
      return res.status(401).json({
        usuario: { ok: false, msg: "Error, usuario o contraseña incorrectos." },
      });
    }
    const token = await generarJWT(usuario[2]);

    res.status(200).json({
      usuario: usuario,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error, comuníquese con el Administrador",
    });
  }
};

const stock = async (req, res = response) => {
  const medicamentos = [];
  const sql = "select * from medicamento";

  try {
    let result = await BD.Open(sql, [], false);
    result.rows.map((medicamento) => {
      let medicamentoSchema = {
        Id: medicamento[0],
        Nombre: medicamento[1],
        Descripcion: medicamento[2],
        Gramos: medicamento[3],
        Stock: medicamento[4],
        "Tipo de Medicamento": medicamento[7],
      };
      medicamentos.push(medicamentoSchema);
    });
    res.status(200).json({ medicamentos });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error, comuníquese con el Administrador",
    });
  }
};

const entrega = async (req, res = response) => {
  const entregas = [];
  const sql = `select med.id_entrega, pa.pri_nombre ||' '|| pa.ape_paterno, medic.nombre, det.cantidad, med.fecha_ent, fu.pri_nombre || ' ' || fu.ape_paterno
  from entrega_medicamento med join prescripcion pres on (med.id_pres=pres.id_pres)
  join paciente pa on (pres.rut_pac=pa.rut_pac) join funcionario fu on (fu.rut_func=med.rut_func)
  join detalle_prescripcion det on (det.id_pres=pres.id_pres) join medicamento medic on (det.id_med=medic.id_med)`;
  try {
    let result = await BD.Open(sql, [], false);
    result.rows.map((entregaMed) => {
      let entregaSchema = {
        Id: entregaMed[0],
        Paciente: entregaMed[1],
        Medicamento: entregaMed[2],
        Cantidad: entregaMed[3],
        "Fecha de Entrega": entregaMed[4],
        Funcionario: entregaMed[5],
      };
      entregas.push(entregaSchema);
    });
    if (entregas.length < 1) {
      return res
        .status(400)
        .json({ ok: false, msg: "No hay ninguna entrega de medicamentos" });
    }
    res.status(200).json({ entregas });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error, comuníquese con el Administrador",
    });
  }
};

const allUsers = async (req, res = response) => {
  const users = [];
  const sql = "select * from database_user";
  let result = await BD.Open(sql, [], false);
  result.rows.map((user) => {
    let userSchema = {
      Id: user[0],
      Usuario: user[4],
      Nombre: user[5],
    };
    users.push(userSchema);
  });
  res.status(200).json({ users });
};

const paciente = async (req, res = response) => {
  const pacientes = [];
  const sql = "select * from paciente";

  try {
    let result = await BD.Open(sql, [], false);
    result.rows.map((pac) => {
      let pacienteSchema = {
        Nombre: pac[2] + " " + pac[4],
        Rut: pac[0] + "-" + pac[1],
        Edad: pac[6],
        Email: pac[9],
      };
      pacientes.push(pacienteSchema);
    });

    if (result.rows.length < 1) {
      return res.json({ ok: false, msg: "No hay pacientes inscritos." });
    }
    res.status(200).json({ pacientes });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error, comuníquese con el Administrador",
    });
  }
};

const receta = async (req, res = response) => {
  const recetas = [];
  const sql = `select pre.id_pres ,pa.pri_nombre ||' '|| pa.ape_paterno, pa.edad, medic.nombre, det.descripcion, det.cantidad, med.pri_nombre ||' '|| med.ape_paterno
  from paciente pa join prescripcion pre on (pre.rut_pac = pa.rut_pac) join detalle_prescripcion det on (pre.id_pres = det.id_pres)
  join medico med on (pre.rut_medico = med.rut_medico) join medicamento medic on (medic.id_med=det.id_med)`;

  try {
    let result = await BD.Open(sql, [], false);
    result.rows.map((rec) => {
      let recetaSchema = {
        Id: rec[0],
        Nombre: rec[1],
        Edad: rec[2],
        Medicamento: rec[3],
        Descripcion: rec[4],
        Cantidad: rec[5],
        Medico: rec[6],
      };
      recetas.push(recetaSchema);
    });
    if (result.rows.length < 1) {
      return res.json({
        ok: false,
        msg: "No hay Prescripciones en este momento.",
      });
    }
    res.status(200).json({ recetas });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error, comuníquese con el Administrador",
    });
  }
};

const revalidarToken = async (req, res = response) => {
  const { id } = req;

  const token = await generarJWT(id);

  res.json({
    ok: true,
    token: token,
  });
};

const merma = async (req, res = response) => {
  const mermas = [];
  const sql =
    "select m.merma_id,me.nombre, m.cantidad, m.detalle, TO_CHAR(m.fecha,'DD/MM/YYYY') from merma m join medicamento me on(m.id_med=me.id_med)";

  try {
    let result = await BD.Open(sql, [], false);
    result.rows.map((m) => {
      let mermasSchema = {
        Id: m[0],
        Nombre: m[1],
        Cantidad: m[2],
        Detalle: m[3],
        Fecha: m[4],
      };
      mermas.push(mermasSchema);
    });
    res.status(200).json({ mermas });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error, comuníquese con el Administrador",
    });
  }
};

module.exports = {
  login,
  stock,
  entrega,
  allUsers,
  paciente,
  receta,
  merma,
  revalidarToken,
};
