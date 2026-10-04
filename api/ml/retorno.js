// GET /api/ml/retorno?code=...&state=<porta>.<aleatorio>
//
// O endereco cadastrado no app do ML. Nao troca o codigo por token aqui:
// so' devolve o codigo para o programa, que esta escutando no proprio
// computador do cliente (127.0.0.1:<porta>). O programa troca em /api/ml/token.
//
// Por que nao trocar aqui e mandar o token: o token passaria pela barra de
// endereco do navegador (e pelo historico dele). O codigo pode passar — e'
// de uso unico, vale poucos minutos e so' serve junto com o nosso segredo.
const { lerEstado } = require("./_comum");

module.exports = (req, res) => {
  const estado = req.query.state;
  const alvo = lerEstado(estado);
  if (!alvo) {
    res.status(400).send("Pedido invalido. Volte ao programa e clique em Conectar de novo.");
    return;
  }
  const params = new URLSearchParams({ state: estado });
  if (req.query.code) params.set("code", String(req.query.code));
  if (req.query.error) params.set("error", String(req.query.error));
  res.redirect(302, `http://127.0.0.1:${alvo.porta}/ml/retorno?${params.toString()}`);
};
