// POST /api/ml/notificacoes
//
// O ML pede uma URL de notificacoes no cadastro do app. Nao usamos
// notificacoes; esta rota so' responde 200 para o ML nao ficar reenviando.
module.exports = (req, res) => {
  res.status(200).json({ ok: true });
};
