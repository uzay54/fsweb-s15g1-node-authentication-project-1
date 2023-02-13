const Users = require("../users/users-model");

/*
  Kullanıcının sunucuda kayıtlı bir oturumu yoksa
  durum 401
  {
    "mesaj": "Geçemezsiniz!"
  }
*/
function sinirli(req, res, next) {
  try {
    if(req.session.user){
      next();
    }
    else{
      next({
        status:401,
        message:"Geçemezsiniz!"
      })
    }
  } catch (err) {
    next(err);
  }
}

/*
  req.body de verilen username halihazırda veritabanında varsa
  durum 422
  {
    "mesaj": "Username kullaniliyor"
  }
*/
async function usernameBostami(req, res, next) {
  try {
    const present = await Users.goreBul({ username: req.body.username }); //user var= =>[{user}],  user yok=> []
    if (present.length > 0) {
      next({ status: 422, message: "Username kullaniliyor" });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
}

/*
  req.body de verilen username veritabanında yoksa
  durum 401
  {
    "mesaj": "Geçersiz kriter"
  }
*/
async function usernameVarmi(req, res, next) {
  try {
    const present = await Users.goreBul({ username: req.body.username });
    if (!present.length) {
      next({ status: 401, message: "Geçersiz kriter" });
    } else {
      req.user = present[0];
      next();
    }
  } catch (err) {
    next(err);
  }
}

/*
  req.body de şifre yoksa veya 3 karakterden azsa
  durum 422
  {
    "mesaj": "Şifre 3 karakterden fazla olmalı"
  }
*/
function sifreGecerlimi(req, res, next) {
  try {
    const { password } = req.body;
    if (!password || password.length <= 3) {
      next({ status: 422, message: "Şifre 3 karakterden fazla olmalı" });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
}

// Diğer modüllerde kullanılabilmesi için fonksiyonları "exports" nesnesine eklemeyi unutmayın.
module.exports = { sinirli, usernameBostami, usernameVarmi, sifreGecerlimi };