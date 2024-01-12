const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const ipAddress = "172.16.31.37"; //Endereço IP da máquina
const port = 3003;

app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "acesso123",
  database: "rpg",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    return;
  }
  console.log("Conectado ao banco de dados MySQL");
});

// Lidar com o envio do formulário de registro (cadastro)
app.post("/registrar", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const checkUserSql = "SELECT * FROM Users WHERE Email = ?";
  db.query(checkUserSql, [email], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Erro ao verificar usuário:", checkErr);
      res.status(500).json({ error: checkErr.message });
    } else if (checkResult.length > 0) {
      // Usuário já cadastrado, exibe mensagem
      res.send(
        "<script>alert('Você já possui uma conta. Clique no botão abaixo para fazer login.'); window.location.href = '/login.html';</script>"
      );
    } else {
      // Usuário não cadastrado, continua com o registro
      const insertUserSql =
        "INSERT INTO Users (Name, Email, Password) VALUES (?, ?, ?)";
      db.query(
        insertUserSql,
        [name, email, password],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Erro ao registrar usuário:", insertErr);
            res.status(500).json({ error: insertErr.message });
          } else {
            console.log("Usuário registrado com sucesso!");
            res.redirect("/login.html");
          }
        }
      );
    }
  });
});

// Rota para servir o HTML de user
app.get("/user.html", (req, res) => {
  res.sendFile(__dirname + "/user.html");
});

// Rota para servir o HTML da página de cadastro
app.get("/cadastro.html", (req, res) => {
  res.sendFile(__dirname + "/cadastro.html");
});

// Rota para servir o HTML de login
app.get("/login.html", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
// Lidar com o envio do formulário de login
app.post("/autenticar", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const sql = "SELECT * FROM Users WHERE Email = ? AND Password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error("Erro ao autenticar usuário:", err);
      return res.status(500).send("Erro ao autenticar usuário.");
    }

    if (result.length > 0) {
      // Usuário autenticado
      res.send(
        "<script>alert('Login bem-sucedido!'); window.location.href = '/carrinho.html';</script>"
      );
    } else {
      // Usuário não autenticado
      res.send(
        "<script>alert('Email ou senha incorretos. Caso não haja cadasttro clique em OK para cadastrar.'); window.location.href = '/cadastro.html';</script>"
      );
    }
  });
});

// Rota para servir o HTML do carrinho
app.get("/carrinho.html", (req, res) => {
  res.sendFile(__dirname + "/carrinho.html");
});

//app.post("/adicionar-ao-carrinho", (req, res) => {
// const userID = req.session.userID; // Se estiver usando autenticação de usuário
// const productID = req.body.productID;

// Adicione lógica para inserir no banco de dados (ShoppingCart)
// const addToCartSql =
//   "INSERT INTO ShoppingCart (UserID, ProductID, Quantity) VALUES (?, ?, 1)";
// db.query(addToCartSql, [userID, productID], (addErr, addResult) => {
//   if (addErr) {
//     console.error("Erro ao adicionar ao carrinho:", addErr);
//    res.json({ success: false, message: "Erro ao adicionar ao carrinho." });
//  } else {
//    res.json({ success: true, message: "Produto adicionado ao carrinho." });
//   }
///  });
//});

//app.get("/produto.html", (req, res) => {
// const productID = req.query.id;

// Ajuste a consulta para selecionar apenas as colunas necessárias
//const sql =
//   "SELECT Name, Description, Price, ImageURL FROM Products WHERE ProductID = ?";
//  db.query(sql, [productID], (err, result) => {
//   if (err) {
//     console.error("Erro ao obter informações do produto:", err);
//    return res.status(500).send("Erro ao obter informações do produto.");
//   }

//   if (result.length > 0) {
//     const product = result[0];
//     // Renderize a página do produto, passando as informações para o template
//    res.render("produto", { product });
//  } else {
// Produto não encontrado
//    res.status(404).send("Produto não encontrado.");
//   }
//  });
//});

// Rota para servir o HTML da página principal
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Rota para servir o HTML da página principal e a requisição do banco de dados.
app.get("/produtos", (req, res) => {
  const sql = "SELECT ProductID, Name, Category, Price, ImageURL FROM Products";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Erro ao buscar dados dos produtos:", err);
      return res.status(500).send("Erro ao buscar dados dos produtos.");
    }

    res.json(result);
  });
});

app.listen(port, ipAddress, () => {
  console.log(`Servidor rodando em http://${ipAddress}:${port}`);
});
