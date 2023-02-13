const router = require("express").Router();
const md = require("./auth-middleware");

const UsersModel = require("../users/users-model");
const bcrypt = require("bcryptjs");
// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }
  response:
  durum 200
  {
    "user_id": 2,
    "username": "sue"
  }
  response username alınmış:
  durum 422
  {
    "mesaj": "Username kullaniliyor"
  }
  response şifre 3 ya da daha az karakterli:
  durum 422
  {
    "mesaj": "Şifre 3 karakterden fazla olmalı"
  }
 */

router.post(
  "/register",
  md.sifreGecerlimi,
  md.usernameBostami,
  (req, res, next) => {
    try {
      const newUser = req.body;
      const hash = bcrypt.hashSync(newUser.password, 8);

      newUser.password = hash;

      UsersModel.ekle(newUser).then((user) => {
        res.status(200).json(user);
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }
  response:
  durum 200
  {
    "mesaj": "Hoşgeldin sue!"
  }
  response geçersiz kriter:
  durum 401
  {
    "mesaj": "Geçersiz kriter"
  }
 */
router.post("/login", md.usernameVarmi, (req, res, next) => {
  try {
    const presentUser = req.user;
    const userPassword = presentUser.password;

    const isEqualPassword = bcrypt.compareSync(req.body.password, userPassword);
    if (!isEqualPassword) {
      next({
        status: 401,
        message: "Geçersiz kriter",
      });
    } else {
      req.session.user= presentUser;
      res.json({ message: `Hoşgeldin ${presentUser.username}!` });
    }
  } catch (err) {
    next(err);
  }
});

/**
  3 [GET] /api/auth/logout
  response giriş yapmış kullanıcılar için:
  durum 200
  {
    "mesaj": "çıkış yapildi"
  }
  response giriş yapmamış kullanıcılar için:
  durum 200
  {
    "mesaj": "oturum bulunamadı"
  }
 */
router.get("/logout", (req, res, next) => {
  try {
    if(req.session.user){
      req.session.destroy(err => {
        if(err){
          next({
            message:"Logout Hata"
          });
        }
        else{
          next({
            status:200,
            message: "çıkış yapildi"
          });
        }
      })
    }
    else{
      next({
        status:200,
        message:"oturum bulunamadı"
      });
    }
  } catch (err) {
    next(err);
  }
});

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

module.exports = router;