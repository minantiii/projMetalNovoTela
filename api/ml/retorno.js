// GET /api/ml/retorno?code=...&state=...
//
// O endereco cadastrado no app do ML. Nao troca o codigo por token aqui: so'
// devolve o codigo para quem pediu, de um destes dois jeitos:
//
// - state "<porta>.<aleatorio>" (botao Conectar): manda para o programa, que
//   esta escutando no proprio computador (127.0.0.1:<porta>);
// - state "remoto.<aleatorio>" (link mandado para o cliente): mostra o codigo
//   numa pagina, para ele copiar e mandar para quem vai colar no programa.
//
// Por que nao trocar aqui e mandar o token: o token passaria pela barra de
// endereco do navegador. O codigo pode passar — e' de uso unico, vale pouco
// tempo e so' serve junto com o nosso segredo.
const { lerEstado } = require("./_comum");

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function paginaRemota(codigo, erro) {
  const corpo = erro
    ? `<h1>Não conectado</h1><p>A permissão não foi concedida. Se foi sem querer, abra o link de novo.</p>`
    : `<h1>Pronto!</h1>
       <p>Copie o código abaixo e mande para quem te enviou o link:</p>
       <div class="codigo" id="codigo">${escapar(codigo)}</div>
       <button onclick="navigator.clipboard.writeText(document.getElementById('codigo').textContent).then(()=>{this.textContent='Copiado!'})">Copiar código</button>
       <p class="obs">O código vale por pouco tempo e só funciona uma vez.</p>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Central Metalsystem</title><style>
body{margin:0;padding:40px 20px;background:#121212;color:#F5F5F7;font:16px/1.6 "Segoe UI",system-ui,sans-serif;text-align:center}
h1{color:#FDB813;font-size:28px;margin:0 0 12px}
.codigo{background:#1C1C1E;border:1px solid #2E2E30;border-radius:8px;padding:16px;margin:16px auto;max-width:560px;font:15px Consolas,monospace;word-break:break-all;user-select:all}
button{background:#FDB813;color:#101010;border:0;border-radius:8px;padding:14px 28px;font-weight:700;font-size:16px;cursor:pointer}
.obs{color:#9A9A9E;font-size:14px;margin-top:20px}
</style></head><body>${corpo}</body></html>`;
}

module.exports = (req, res) => {
  const estado = req.query.state;
  const alvo = lerEstado(estado);
  if (!alvo) {
    res.status(400).send("Pedido invalido. Volte ao programa e clique em Conectar de novo.");
    return;
  }
  if (alvo.remoto) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(paginaRemota(req.query.code || "", req.query.error || (req.query.code ? "" : "sem codigo")));
    return;
  }
  const params = new URLSearchParams({ state: estado });
  if (req.query.code) params.set("code", String(req.query.code));
  if (req.query.error) params.set("error", String(req.query.error));
  res.redirect(302, `http://127.0.0.1:${alvo.porta}/ml/retorno?${params.toString()}`);
};
