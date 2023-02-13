// const express=require("express");
// const router = express.Router();

const router = require("express").Router();

// `sinirli` middlewareını `auth-middleware.js` dan require edin. Buna ihtiyacınız olacak!

const { sinirli } = require("../auth/auth-middleware");
const Users = require("./users-model");

/**
  [GET] /api/users
  Bu uç nokta SINIRLIDIR: sadece kullanıcı girişi yapmış kullanıcılar
  ulaşabilir.
  response:
  durum 200
  [
    {
      "user_id": 1,
      "username": "bob"
    },
    // etc
  ]
  response giriş yapılamadıysa:
  durum 401
  {
    "mesaj": "Geçemezsiniz!"
  }
 */

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.
router.get("/", sinirli, (req, res, next) => {
  try {
    
    Users.bul().then((user) => {
      res.status(200).json(user);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;