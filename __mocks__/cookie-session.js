let tempSession,
    session = {};

//essa é a função que mimifica o cookie-session. Ela é uma função que retorna uma outra função. Ela pega o objeto que foi enviado (o segredo e o tempo para o cookie) e adiciona ao objeto substituindo o que estava dentro por algo null.
module.exports = () => (req, res, next) => {
    req.session = tempSession || session;
    tempSession = null;
    next();
};

//essa linha vai criar um cookie que pode ser usado em múltiplas sessões de teste.
module.exports.mockSession = sess => (session = sess);

//essa linha vai criar um cookie somente para o nosso teste, que irá sumir quando terminarmos. Ele apaga o cookie cada vez que o middleware do cookie-session roda.
// sess é um objeto vazio que se relaciona com o nosso cookie. O tempSession coloca esse dado que estava no cookie na nossa sessão para que possamos trabalhar
module.exports.mockSessionOnce = sess => (tempSession = sess);
