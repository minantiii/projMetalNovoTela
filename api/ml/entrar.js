// GET /api/ml/entrar?state=<porta>.<aleatorio>
//
// O botao "Conectar" do programa abre esta pagina no navegador; ela manda
// para o login oficial do Mercado Livre. Existe para o exe nao precisar
// saber nem o App ID: tudo que e' do app do ML fica na Vercel.
const { URL_AUTORIZAR, RETORNO, credenciais, lerEstado } = require("./_comum");

module.exports = (req, res) => {
  const estado = req.query.state;
  if (!lerEstado(estado)) {
    res.status(400).send("Pedido invalido. Use o botao Conectar do programa.");
    return;
  }
  let id;
  try {
    ({ id } = credenciais());
  } catch (e) {
    res.status(500).send(String(e.message));
    return;
  }
  const url = new URL(URL_AUTORIZAR);
  url.search = new URLSearchParams({
    response_type: "code", client_id: id, redirect_uri: RETORNO, state: estado,
  }).toString();
  res.redirect(302, url.toString());
};
