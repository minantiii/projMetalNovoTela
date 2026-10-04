// Pecas comuns das funcoes do login do Mercado Livre.
//
// O client secret do app do ML mora SO' aqui, nas variaveis de ambiente da
// Vercel (ML_CLIENT_ID, ML_CLIENT_SECRET). O exe nunca ve' o segredo: ele
// pede para estas funcoes falarem com o ML por ele.
//
// O arquivo comeca com "_" para a Vercel nao publica-lo como rota.

const URL_TOKEN = "https://api.mercadolibre.com/oauth/token";
const URL_AUTORIZAR = "https://auth.mercadolivre.com.br/authorization";
const RETORNO = "https://central-metalsystem.vercel.app/api/ml/retorno";

function credenciais() {
  const id = process.env.ML_CLIENT_ID;
  const segredo = process.env.ML_CLIENT_SECRET;
  if (!id || !segredo) {
    throw new Error("ML_CLIENT_ID / ML_CLIENT_SECRET nao configurados na Vercel");
  }
  return { id, segredo };
}

// O "state" que o programa manda e' "<porta>.<aleatorio>": a porta diz para
// onde devolver o codigo no computador do cliente, o aleatorio o programa
// confere para saber que a resposta e' do pedido que ELE fez.
function lerEstado(estado) {
  const m = /^(\d{4,5})\.([A-Za-z0-9_-]{16,64})$/.exec(String(estado || ""));
  if (!m) return null;
  const porta = Number(m[1]);
  if (porta < 1024 || porta > 65535) return null;
  return { porta };
}

async function pedirToken(campos) {
  const { id, segredo } = credenciais();
  const corpo = new URLSearchParams({ client_id: id, client_secret: segredo, ...campos });
  const r = await fetch(URL_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: corpo.toString(),
  });
  const dados = await r.json().catch(() => ({}));
  return { status: r.status, dados };
}

async function lerCorpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

module.exports = { URL_AUTORIZAR, RETORNO, credenciais, lerEstado, pedirToken, lerCorpo };
