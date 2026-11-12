/**
 * Rotação de mensagens: garante que, dentro de um grupo de mensagens (ex.:
 * "tela inicial — não treinou"), todas as opções sejam exibidas antes de
 * qualquer uma se repetir — em vez de um sorteio puro (Math.random a cada
 * chamada), que pode repetir a mesma mensagem várias vezes seguidas e nunca
 * mostrar outras.
 *
 * Cada ciclo embaralha a ordem das mensagens (pra não virar sempre a mesma
 * sequência fixa 1-2-3-4), mas sempre visita todas antes de embaralhar de
 * novo para o próximo ciclo.
 *
 * O estado fica em memória (por `chave`), então dura enquanto o app estiver
 * aberto. Isso é suficiente para o caso de uso: alternar as mensagens ao
 * longo do uso do app numa mesma sessão.
 */

interface EstadoRotacao {
  ordem: number[];
  indice: number;
}

const estadosPorChave = new Map<string, EstadoRotacao>();

function embaralhar(tamanho: number): number[] {
  const indices = Array.from({ length: tamanho }, (_, indice) => indice);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Escolhe a próxima mensagem de `mensagens` para o grupo identificado por
 * `chave`, alternando entre todas as opções do grupo antes de repetir
 * qualquer uma. Use a mesma `chave` em todas as chamadas que devem
 * compartilhar a mesma rotação (ex.: sempre "entrada-nao-treinou" para o
 * grupo de mensagens de quem ainda não treinou no dia).
 */
export function escolherMensagemRotativa(chave: string, mensagens: readonly string[]): string {
  if (mensagens.length === 0) {
    return '';
  }
  if (mensagens.length === 1) {
    return mensagens[0];
  }

  let estado = estadosPorChave.get(chave);
  if (!estado || estado.ordem.length !== mensagens.length || estado.indice >= estado.ordem.length) {
    estado = { ordem: embaralhar(mensagens.length), indice: 0 };
    estadosPorChave.set(chave, estado);
  }

  const indiceEscolhido = estado.ordem[estado.indice];
  estado.indice += 1;

  return mensagens[indiceEscolhido];
}
