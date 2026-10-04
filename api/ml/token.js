// POST /api/ml/token   {"code": "..."}            -> tokens do ML
// POST /api/ml/token   {"refresh_token": "..."}   -> tokens renovados
//
// O programa manda o codigo (ou o refresh token); aqui se acrescenta o
// client secret e se pergunta ao ML. A resposta do ML volta como veio.
//
// O refresh token do ML e' de uso unico: cada renovacao devolve um novo, e o
// programa precisa guardar o novo — senao a proxima renovacao falha.
const { RETORNO, pedirToken, lerCorpo } = require("./_comum");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "use POST" });
    return;
  }
  const corpo = await lerCorpo(req);
  let campos;
  if (corpo.code) {
    campos = { grant_type: "authorization_code", code: String(corpo.code), redirect_uri: RETORNO };
  } else if (corpo.refresh_token) {
    campos = { grant_type: "refresh_token", refresh_token: String(corpo.refresh_token) };
  } else {
    res.status(400).json({ erro: "falta code ou refresh_token" });
    return;
  }
  try {
    const { status, dados } = await pedirToken(campos);
    res.status(status).json(dados);
  } catch (e) {
    res.status(500).json({ erro: String(e.message) });
  }
};
