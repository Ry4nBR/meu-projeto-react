# 🛠️ Plano de Refatoração Técnica — Nimble Quest RPG Arcade

> **Instrução para o Agente (Antigravity / Gemini):**
> Execute este documento de refatoração **bloco por bloco, atividade por atividade**. Ao concluir cada atividade, valide se o build e a execução no navegador estão sem erros antes de prosseguir. O versionamento segue **Semantic Versioning (`SemVer`)** partindo da base atual (`v0.1.0`) até o lançamento estável (`v1.0.0`).

---

## 📌 Diagnóstico dos Problemas Atuais (Escopo da Refatoração)
1. **Física e Bordas:** O líder atravessa os limites do mapa em vez de morrer ao colidir com as paredes da arena.
2. **Coesão da Fila (Snake):** Os membros da fila se separam ou quebram o alinhamento durante curvas e combates.
3. **Congelamento ao Sofrer Dano:** Os personagens travam ou param de seguir a fila ao receberem dano.
4. **Representação Visual e UI:** Sprites genéricos, falta de feedback visual de combate e interface desorganizada.
5. **Mecânicas de RPG Incompletas:** Necessidade de classes distintas (Druida, Bruxa de Gelo, Mago de Vento, Necromante), sistema de ondas, drops de moedas, compra de slots e recrutas raros.

---

## 📦 BLOCO 1: Core Engine, Física de Bordas e Coesão da Fila (`v0.2.0`)

### 🔹 Atividade 1.1: Delimitação Precisa da Arena e Morte Instantânea nas Bordas
* **Especificação Técnica:**
  * Definir constantes claras de margem interna da arena (`ARENA_PADDING = 24px`) dentro do `<canvas>`.
  * Renderizar uma borda física visível (estilo masmorra/paredes de pedra com destaque neon).
  * Implementar verificação rigorosa de colisão AABB/Radial para o líder (`party[0]`): se `x <= ARENA_PADDING`, `x >= CANVAS_WIDTH - ARENA_PADDING`, `y <= ARENA_PADDING` ou `y >= CANVAS_HEIGHT - ARENA_PADDING`, disparar imediatamente o estado `GAMEOVER`.
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "fix(arena): enforce strict arena wall boundaries and instant death on collision"
  git tag -a v0.2.1 -m "Fix arena wall collision and boundaries"
  ```

### 🔹 Atividade 1.2: Algoritmo de Movimentação Contínua da Fila (`PathHistory`)
* **Especificação Técnica:**
  * Substituir a lógica atual de seguimento por um vetor contínuo de histórico de coordenadas (`pathHistory`) atualizado a cada frame de movimento do líder.
  * Calcular o posicionamento de cada membro `i` da fila percorrendo o `pathHistory` com base na distância euclidiana fixa (`MEMBER_SPACING = 32px`).
  * **Garantia:** A fila nunca deve se separar, esticar ou perder membros durante curvas rápidas.
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "refactor(movement): implement distance-based pathHistory for unbreakable snake formation"
  git tag -a v0.2.2 -m "Refactor snake party cohesion algorithm"
  ```

### 🔹 Atividade 1.3: Sistema de Dano Contínuo Sem Congelamento
* **Especificação Técnica:**
  * Remover qualquer trava de estado (`isStunned`, `isFrozen`, `pauseMovement`) aplicada aos heróis quando sofrem dano.
  * Ao colidir com inimigos ou projéteis inimigos, o membro atingido deve apenas ter seu `currentHp` reduzido e ativar um timer puramente visual (`hitFlashTimer = 150ms`) para piscar em branco/vermelho, mantendo 100% da velocidade de acompanhamento na fila.
  * Somente quando `currentHp <= 0`, o personagem é removido do array `party` e a fila se fecha suavemente. Se o líder morrer e houver outros membros, o próximo da fila assume a liderança; se a fila esvaziar, dispara `GAMEOVER`.
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "fix(combat): prevent hero movement freeze on damage and handle smooth member death"
  git tag -a v0.2.3 -m "Fix damage freeze bug and party reorganization"
  ```

---

## 🧙‍♂️ BLOCO 2: Classes Especializadas e Invocações Autônomas (`v0.3.0`)

### 🔹 Atividade 2.1: Guerreiro, Bruxa de Gelo, Druida e Mago de Vento
* **Especificação Técnica:**
  * Implementar a estrutura base de classes com tempos de recarga (`cooldown`) independentes:
    1. **Guerreiro (`KNIGHT`):** Alto HP, ataque corpo a corpo em arco frontal/lateral contra inimigos próximos.
    2. **Bruxa de Gelo (`ICE_WITCH`):** Dispara cristais de gelo que aplicam o status `FROZEN` (inimigo fica azulado e tem velocidade reduzida a 0% ou 20% por `2.5s`).
    3. **Druida (`DRUID`):** A cada `4s`, emite uma aura verde que cura o HP do membro da fila com menor percentual de vida atual.
    4. **Mago de Vento (`WIND_MAGE`):** A cada `3.5s`, libera uma onda de choque radial que aplica *knockback* (empurra os inimigos próximos para longe da fila).
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "feat(classes): implement Knight, Ice Witch, Druid, and Wind Mage mechanics"
  git tag -a v0.3.1 -m "Add core RPG hero classes and abilities"
  ```

### 🔹 Atividade 2.2: Necromante e Sistema de Esqueletos Invocados Acumuláveis
* **Especificação Técnica:**
  * Criar a classe **Necromante (`NECROMANCER`)** com um timer interno de `15000ms` (15 segundos).
  * Ao completar o ciclo, invoca uma entidade autônoma (`SkeletonMinion`) no mapa com HP razoável (ex: `80 HP`), velocidade própria e IA de perseguição.
  * Os esqueletos não ocupam slots da fila, agem livremente no mapa perseguindo e atacando inimigos, sofrem dano normalmente e **podem ser acumulados** (se o Necromante sobreviver por 45s, haverá até 3 esqueletos ativos simultaneamente).
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "feat(necromancer): add autonomous stackable skeleton summons every 15 seconds"
  git tag -a v0.3.2 -m "Implement Necromancer and stackable skeleton minions"
  ```

---

## 💰 BLOCO 3: Ondas, Economia, Loja de Slots e Recrutas Raros (`v0.4.0`)

### 🔹 Atividade 3.1: Sistema de Waves, Drop de Moedas e Expansão de Slots
* **Especificação Técnica:**
  * Estruturar o progresso em **Waves (Ondas)** com contador de inimigos restantes e escalonamento de dificuldade.
  * Ao morrer, inimigos dropam moedas (`CoinEntity`) no chão que são atraídas magneticamente quando o líder passa próximo.
  * Definir o limite inicial máximo da fila em **7 slots** (`maxPartySlots = 7`).
  * Criar um painel de **Loja de Slots** onde o jogador gasta moedas acumuladas para comprar `+1 Slot` (com custo progressivo, ex: `100`, `200`, `350` moedas), permitindo filas maiores nas waves avançadas.
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "feat(economy): implement wave system, magnetic coin drops, and party slot upgrades"
  git tag -a v0.4.1 -m "Add wave system, coin drops, and slot shop"
  ```

### 🔹 Atividade 3.2: Spawn Aleatório de Recrutas e Personagem Bônus Raro
* **Especificação Técnica:**
  * A cada nova wave, gerar pontos de recrutamento aleatórios dentro da arena contendo heróis das classes disponíveis. Ao coletar (se `party.length < maxPartySlots`), o herói entra no final da fila.
  * Implementar um evento de **Recruta Bônus Raro** (`15%` de chance antes de os últimos inimigos da wave serem derrotados): surge um herói com aura dourada e indicador visual na arena que concede atributos bônus (`+30% HP e Dano`) se resgatado antes do fim da wave.
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "feat(spawns): add random wave recruits and rare golden bonus hero spawn"
  git tag -a v0.4.2 -m "Implement random recruits and rare bonus hero mechanic"
  ```

---

## 🎨 BLOCO 4: Direção de Arte Pixel/Arcade e Interface Moderna (`v1.0.0`)

### 🔹 Atividade 4.1: Refatoração Visual dos Sprites no Canvas e Feedback de Combate
* **Especificação Técnica:**
  * Substituir círculos/quadrados simples por desenhos detalhados em estilo **Chibi Pixel/Arcade** no Canvas (capacetes, chapéus de bruxa, cajados, ossos nos esqueletos, coroas no líder).
  * Adicionar efeitos visuais de partículas (gelo estilhaçando, folhas de cura, anéis de vento, fumaça roxa de invocação), números de dano flutuantes (`FloatingText`) e micro-barras de HP limpas acima de cada entidade.
* **Controle de Versão:**
  ```bash
  git add .
  git commit -m "style(canvas): upgrade character sprites, particle effects, and floating combat text"
  git tag -a v0.5.0 -m "Overhaul canvas art and visual combat feedback"
  ```

### 🔹 Atividade 4.2: Polimento da Interface (HUD Dark Fantasy) e Release Final
* **Especificação Técnica:**
  * Reconstruir toda a interface externa ao Canvas com design **Dark Fantasy / Arcade** responsivo (Tailwind CSS):
    * **Top HUD:** Wave atual, Ouro acumulado, Inimigos restantes e Contador de Slots (`X / Max`).
    * **Painel Lateral da Fila:** Lista visual com ícone da classe, nome, barra de vida em tempo real e botão rápido para comprar novo slot quando houver moedas suficientes.
    * **Modais:** Tela inicial temática com guia rápido das classes e tela de Game Over com estatísticas completas da partida.
* **Controle de Versão (Release Oficial):**
  ```bash
  git add .
  git commit -m "feat(ui): complete dark fantasy arcade HUD, party inspector, and release v1.0.0"
  git tag -a v1.0.0 -m "Release v1.0.0 - Nimble Quest RPG Arcade"
  git push origin main --tags
  ```