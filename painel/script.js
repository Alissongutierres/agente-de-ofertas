const formulario = document.getElementById("formulario");
const resultado = document.getElementById("resultado");
let ultimoModelo = -1;
let ultimoTema = -1;

const moeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const modelos = [
    (d) => `🔥 OFERTA RELÂMPAGO 🔥\n\n${d.nome}\n\n❌ De ${d.antigo}\n✅ Por apenas ${d.atual} (${d.desconto}% OFF)${d.extra}\n\n👉 Garanta aqui: ${d.link}`,
    (d) => `💥 ACHADO DO DIA 💥\n\n${d.nome}\n\nAntes: ${d.antigo}\nAgora: ${d.atual}\nEconomia de ${d.desconto}%!${d.extra}\n\n🛒 Compre: ${d.link}`,
    (d) => `🚨 CORRE QUE TÁ BARATO! 🚨\n\n${d.nome}\n\n💰 ${d.atual} (era ${d.antigo})\n📉 ${d.desconto}% de desconto${d.extra}\n\nLink: ${d.link}`,
    (d) => `⚡ PREÇO BAIXOU ⚡\n\n${d.nome} por ${d.atual}!\n\nEra ${d.antigo}, ou seja, ${d.desconto}% OFF.${d.extra}\n\n🔗 ${d.link}`,
    (d) => `🎯 OFERTA IMPERDÍVEL 🎯\n\n${d.nome}\n\n💸 Por ${d.atual}\n🏷️ ${d.desconto}% abaixo do preço antigo (${d.antigo})${d.extra}\n\nAproveite: ${d.link}`,
    (d) => `📢 OLHA ISSO! 📢\n\n${d.nome}\n\nDe ${d.antigo} por ${d.atual} 😱\n${d.desconto}% OFF${d.extra}\n\n👇 Pegue aqui\n${d.link}`
];

const temas = [
    { fundo1: "#1a1830", fundo2: "#0f0e17", selo: "#ffe600", seloTexto: "#111111", nome: "#ffffff", antigo: "#c9c9e3", preco: "#ffe600" },
    { fundo1: "#c62828", fundo2: "#7f0000", selo: "#ffe600", seloTexto: "#111111", nome: "#ffffff", antigo: "#ffcdd2", preco: "#ffffff" },
    { fundo1: "#0d6b3e", fundo2: "#053d22", selo: "#ffffff", seloTexto: "#0d6b3e", nome: "#ffffff", antigo: "#c8e6c9", preco: "#ffe600" },
    { fundo1: "#ff8f00", fundo2: "#e65100", selo: "#111111", seloTexto: "#ffe600", nome: "#ffffff", antigo: "#ffe0b2", preco: "#111111" }
];

const sortear = (lista, ultimo) => {
    let indice;
    do {
        indice = Math.floor(Math.random() * lista.length);
    } while (indice === ultimo);
    return indice;
};

const carregarImagem = (arquivo) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(arquivo);
    });

const quebrarLinhas = (ctx, texto, larguraMax, maxLinhas) => {
    const palavras = texto.split(" ");
    const linhas = [];
    let linha = "";
    for (const palavra of palavras) {
        const teste = linha ? linha + " " + palavra : palavra;
        if (ctx.measureText(teste).width > larguraMax && linha) {
            linhas.push(linha);
            linha = palavra;
        } else {
            linha = teste;
        }
    }
    if (linha) linhas.push(linha);
    if (linhas.length > maxLinhas) {
        linhas.length = maxLinhas;
        linhas[maxLinhas - 1] = linhas[maxLinhas - 1].replace(/\s*\S*$/, "") + "…";
    }
    return linhas;
};

const desenharCartao = async (arquivo, dados, tema) => {
    const img = await carregarImagem(arquivo);

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    canvas.className = "cartao-foto";
    const ctx = canvas.getContext("2d");

    const fundo = ctx.createLinearGradient(0, 0, 0, 1080);
    fundo.addColorStop(0, tema.fundo1);
    fundo.addColorStop(1, tema.fundo2);
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(90, 170, 900, 560, 32);
    ctx.fill();

    const escala = Math.min(860 / img.width, 520 / img.height);
    const w = img.width * escala;
    const h = img.height * escala;
    ctx.drawImage(img, 540 - w / 2, 450 - h / 2, w, h);

    ctx.fillStyle = tema.selo;
    ctx.beginPath();
    ctx.roundRect(40, 40, 300, 110, 24);
    ctx.fill();

    ctx.fillStyle = tema.seloTexto;
    ctx.font = "bold 58px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${dados.desconto}% OFF`, 190, 96);

    ctx.fillStyle = tema.nome;
    ctx.font = "bold 46px Arial";
    const linhas = quebrarLinhas(ctx, dados.nome, 940, 2);
    linhas.forEach((linha, i) => ctx.fillText(linha, 540, 790 + i * 58));

    ctx.font = "36px Arial";
    ctx.fillStyle = tema.antigo;
    const textoAntigo = `De ${dados.antigo}`;
    ctx.fillText(textoAntigo, 540, 925);
    const larguraAntigo = ctx.measureText(textoAntigo).width;
    ctx.strokeStyle = tema.antigo;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(540 - larguraAntigo / 2, 925);
    ctx.lineTo(540 + larguraAntigo / 2, 925);
    ctx.stroke();

    ctx.fillStyle = tema.preco;
    ctx.font = "bold 100px Arial";
    ctx.fillText(`POR ${dados.atual}`, 540, 1010);

    return canvas;
};

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const atual = parseFloat(document.getElementById("precoAtual").value);
    const antigo = parseFloat(document.getElementById("precoAntigo").value);

    if (atual >= antigo) {
        alert("O preço atual precisa ser menor que o preço antigo.");
        return;
    }

    const diferenciais = document.getElementById("diferenciais").value.trim();

    const dados = {
        nome: document.getElementById("nome").value.trim(),
        atual: moeda(atual),
        antigo: moeda(antigo),
        desconto: Math.round((1 - atual / antigo) * 100),
        link: document.getElementById("link").value.trim(),
        extra: diferenciais ? `\n\n✨ ${diferenciais}` : ""
    };

    ultimoModelo = sortear(modelos, ultimoModelo);
    const texto = modelos[ultimoModelo](dados);

    const arquivos = document.getElementById("imagens").files;
    let cartao = null;
    if (arquivos.length > 0) {
        ultimoTema = sortear(temas, ultimoTema);
        try {
            cartao = await desenharCartao(arquivos[0], dados, temas[ultimoTema]);
        } catch (erro) {
            console.error("Não foi possível montar o cartão:", erro);
        }
    }

    resultado.innerHTML = "";

    const paragrafo = document.createElement("p");
    paragrafo.textContent = texto;
    resultado.append(paragrafo);

    if (cartao) {
        const botaoBaixar = document.createElement("button");
        botaoBaixar.type = "button";
        botaoBaixar.textContent = "Baixar imagem";
        botaoBaixar.addEventListener("click", () => {
            const atalho = document.createElement("a");
            atalho.href = cartao.toDataURL("image/png");
            atalho.download = "oferta.png";
            atalho.click();
        });
        resultado.append(cartao, botaoBaixar);
    }

    const botaoCopiar = document.createElement("button");
    botaoCopiar.type = "button";
    botaoCopiar.textContent = "Copiar texto";
    botaoCopiar.addEventListener("click", async () => {
        await navigator.clipboard.writeText(texto);
        botaoCopiar.textContent = "Copiado!";
        setTimeout(() => {
            botaoCopiar.textContent = "Copiar texto";
        }, 1500);
    });

    const botaoWhats = document.createElement("button");
    botaoWhats.type = "button";
    botaoWhats.textContent = "Abrir no WhatsApp";
    botaoWhats.addEventListener("click", () => {
        window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank");
    });

    resultado.append(botaoCopiar, botaoWhats);
});