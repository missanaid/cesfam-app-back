const { Router } = require("express");
const router = Router();
const {
  login,
  stock,
  entrega,
  paciente,
  receta,
  revalidarToken,
  merma,
} = require("../controllers/auth");
const { check } = require("express-validator");
const { validarJWT } = require("../middlewares/validar-jwt");

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
router.get("/merma", merma);

router.get("/paciente", paciente);

router.get("/", validarJWT, revalidarToken);

module.exports = router;
