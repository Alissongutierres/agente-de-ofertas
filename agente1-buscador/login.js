// ============================================================
// login.js  —  AGENTE 1 (buscador de ofertas)
// ------------------------------------------------------------
// OBJETIVO: você faz o login no Mercado Livre UMA vez, na mão,
// e o navegador guarda a sessão numa pasta. Depois, o agente
// abre o navegador já logado, sem precisar de senha no código.
// ============================================================


// ---------- 1) IMPORTAÇÕES ----------

// chromium = o navegador que o Playwright controla.
// (vem da biblioteca "playwright" que você instalou com npm)
const { chromium } = require('playwright');

// path = ferramenta do Node para montar caminhos de pasta
// sem errar as barras (o Windows usa \ e outros sistemas usam /).
const path = require('path');

// readline = ferramenta do Node para ler o que você digita
// no terminal. Vamos usar para "esperar você apertar Enter".
const readline = require('readline');


// ---------- 2) CONFIGURAÇÕES ----------

// Pasta onde o navegador vai guardar o login (cookies, sessão).
// __dirname = a pasta onde ESTE arquivo está (agente1-buscador).
// Resultado: agente1-buscador/sessao-ml
const PASTA_SESSAO = path.join(__dirname, 'sessao-ml');

// Página que vamos abrir para você fazer o login.
const URL_ML = 'https://www.mercadolivre.com.br';


// ---------- 3) FUNÇÃO AUXILIAR: ESPERAR O ENTER ----------

// Recebe um texto, mostra no terminal e só termina
// quando você apertar Enter.
// "Promise" = uma promessa de que a resposta vem depois.
// Assim, o "await" lá embaixo consegue PAUSAR o programa.
function esperarEnter(texto) {
  // Cria a "conversa" com o terminal (entrada e saída).
  const rl = readline.createInterface({
    input: process.stdin,   // o que você digita
    output: process.stdout, // o que o programa escreve
  });

  return new Promise((resolve) => {
    // Mostra o texto e espera você apertar Enter.
    rl.question(texto, () => {
      rl.close();  // fecha a conversa com o terminal
      resolve();   // avisa: "pronto, pode continuar"
    });
  });
}


// ---------- 4) FUNÇÃO PRINCIPAL ----------

// "async" permite usar "await" dentro da função.
// "await" = espere esta tarefa terminar antes de ir para a próxima.
async function main() {

  console.log('Abrindo o navegador...');

  // launchPersistentContext = abre o navegador USANDO uma pasta
  // para guardar tudo (login, cookies). É isso que "lembra" a sessão.
  const contexto = await chromium.launchPersistentContext(PASTA_SESSAO, {
    headless: false, // false = a janela APARECE (você precisa ver para logar)
    channel: 'msedge',
    viewport: null,  // usa o tamanho normal da janela
  });

  // Pega a primeira aba que abriu; se não tiver, cria uma.
  const pagina = contexto.pages()[0] || (await contexto.newPage());

  // Vai até o site do Mercado Livre.
  await pagina.goto(URL_ML);

  console.log('');
  console.log('1) Na janela que abriu, faça login na sua conta do Mercado Livre.');
  console.log('2) Confirme que aparece o seu nome no topo do site.');
  console.log('3) Volte aqui no terminal.');
  console.log('');

  // O programa PARA aqui até você apertar Enter no terminal.
  await esperarEnter('Já está logado? Aperte ENTER para salvar e fechar... ');

  // Fecha o navegador. A sessão já ficou salva na pasta sessao-ml.
  await contexto.close();

  console.log('Sessão salva em: ' + PASTA_SESSAO);
}


// ---------- 5) EXECUÇÃO ----------

// Chama a função principal. Se algo der erro, mostra no terminal
// em vez de o programa quebrar em silêncio.
main().catch((erro) => {
  console.error('Deu erro:', erro);
  process.exit(1); // encerra o programa avisando que falhou
});
