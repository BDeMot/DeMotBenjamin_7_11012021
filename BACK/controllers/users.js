const connection = require('../db')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken')

exports.addUser = (req, res, next) => {
  const hash = bcrypt.hashSync(req.body.user.password, 10)
  const uuid = uuidv4();
  const user = [
    uuid,
    req.body.user.pseudo,
    req.body.user.email,
    hash
  ]

  connection.query('INSERT INTO users SET id = ?, user = ?, email = ?, password = ?',
  user,
  function(error, results, fields) {
    if (error) {
      res.status(403).json({ message : error.sqlMessage })
    }
    if (results) {
      res.status(201).json({ 
        message : 'Utilisateur créé !',
        userPseudo: req.body.user.pseudo,
        token: jwt.sign(
          { userId: uuid },
          process.env.TOKEN_SECRET,
          { expiresIn: '12h' }
        )})
    }
  })
}

exports.loginUser = (req, res, next) => {
  const email = req.body.email

  connection.query('SELECT * FROM users WHERE email= ?', 
    email, 
    function (error, results, fields) {
      if (error) {
        res.status(404).json({ message : error.sqlMessage })
      }
      if (results) {
        const correctPassword = bcrypt.compare(req.body.password, results[0].password)

        if(results.length >= 1 && correctPassword) {
          res.status(200).json({ 
            message : 'Connexion établie !',
            userPseudo: results[0].user,
            privilege: results[0].privilege,
            token: jwt.sign(
              { userId: results[0].id },
              process.env.TOKEN_SECRET,
              { expiresIn: '12h' }
            )})
        } else {
          console.log(hash)
          res.status(401).json({ message : "L'email ou le mot de passe sont erronés." })
        }
      }
      if(fields) {
        console.log("User querying a connexion")
      }
    }
  )
}