const { Router } = require("express");
const router = Router();
const {
  login,
  stock,
  entrega,
  paciente,
  receta,
  revalidarToken,
} = require("../controllers/auth");
const { check } = require("express-validator");
const { validarJWT } = require("../middlewares/validar-jwt");

router.get("/", validarJWT, revalidarToken);

router.get("/entrega", entrega);
router.get("/receta", receta);

router.post(
  "/login",
  [
    check("user", "El Usuario es obligatorio").not().isEmpty(),
    check("password", "La Contraseña es obligatoria").not().isEmpty(),
  ],
  login
);

router.get("/stock", stock);

router.get("/paciente", paciente);

module.exports = router;
