# 🎮 Plano de Micro-Atividades: RPG Tático Arcade (Estilo Nimble Quest)

Este documento contém um roteiro de desenvolvimento granular (micro-nano atividades). Cada atividade é um **microcard** pronto para ser copiado e colado no **GitHub Copilot** (no VS Code), seguido pelos comandos exatos de `commit` e `tag` para controle de versão semântico.

## 📌 Convenções do Projeto

* **Framework:** React + HTML5 Canvas

* **Padrão de Commit:** [Conventional Commits](https://www.conventionalcommits.org/)

* **Tagging:** Versione de `v0.1.0` a `v1.0.0` em incrementos por funcionalidade e `v1.0.x` para correções de bugs.

---

## 🚀 FASE 1: Setup do Projeto e Loop do Canvas

### 🎴 CARD-01: Inicialização do Projeto React e Layout Base

* **Objetivo:** Criar o projeto React e a estrutura limpa do container do jogo.

* **Prompt para Copilot:**

  > "Crie a estrutura base de uma aplicação React com um container centralizado para um HTML5 Canvas de tamanho 800x600 pixels. Adicione estilos CSS flexbox para centralizar o canvas na tela e aplique um fundo escuro `#1a1a1a` ao container."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "chore(setup): initialize react project with game canvas layout"
  git tag -a v0.1.0 -m "Setup inicial do projeto e container Canvas"
  ```

### 🎴 CARD-02: Game Loop (Hook de Animação do Canvas)

* **Objetivo:** Criar o loop de renderização usando `requestAnimationFrame` em um React Hook.

* **Prompt para Copilot:**

  > "Crie um hook customizado React chamado `useGameLoop` que aceite uma função de callback de render e atualização. Use `requestAnimationFrame` para executar o loop a 60 FPS com cálculo de `deltaTime`. Garanta a limpeza adequada dos listeners ao desmontar o componente."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(engine): create useGameLoop hook with requestAnimationFrame"
  git tag -a v0.1.1 -m "Implementacao do Game Loop com delta time"
  ```

### 🎴 CARD-03: Captura de Entradas (Teclado - WASD / Setas)

* **Objetivo:** Capturar o direcionamento do jogador via teclado impedindo inversão instantânea de 180°.

* **Prompt para Copilot:**

  > "Crie um sistema de escuta de eventos de teclado (WASD e Setas direcionais) para controlar a direção atual do líder do grupo. Armazene a direção como vetor `{ x, y }` e previna a movimentação no sentido oposto imediato (evitar colisão com o próprio corpo)."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(input): add keyboard movement handler for WASD and arrows"
  git tag -a v0.1.2 -m "Captura de comandos de movimentacao do jogador"
  ```

### 🎴 CARD-04: Histórico de Posições e Movimento da Fila (Snake-like)

* **Objetivo:** Fazer o líder se mover e os membros da fila seguirem a trajetória com base em um buffer de posições passadas.

* **Prompt para Copilot:**

  > "Implemente o movimento do líder da fila com velocidade constante. Mantenha um array de histórico de posições anteriores (`positionHistory`). Fazer com que cada membro subsequente da fila siga a posição ocupada pelo membro anterior a um intervalo de distância fixo `spacing`."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(movement): implement queue position history for snake-like party movement"
  git tag -a v0.2.0 -m "Movimentacao estilo Snake para a fila de herois"
  ```

### 🎴 CARD-05: Renderização Visual de Teste dos Membros da Fila

* **Objetivo:** Desenhar o líder e seguidores com cores distintas e indicação de direção visual.

* **Prompt para Copilot:**

  > "Desenhe no Canvas os membros da fila como círculos/quadrados. O líder deve ter a cor dourada (`#ffd700`) e os seguidores a cor azul (`#4682b4`). Desenhe um indicador simples (um pequeno traço ou seta) mostrando para onde o líder está apontando."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "style(canvas): render party leader and followers with visual distinctions"
  git tag -a v0.2.1 -m "Renderizacao visual basica dos membros da fila"
  ```

---

## ⚔️ FASE 2: Entidades, Vida e Combate Base

### 🎴 CARD-06: Modelo de Dados dos Personagens e Inimigos

* **Objetivo:** Definir os objetos e interfaces de estado para personagens da fila e inimigos.

* **Prompt para Copilot:**

  > "Crie as estruturas de dados (interfaces ou objetos JS) para os personagens da fila e para os inimigos. Um personagem deve conter: `id`, `name`, `classType`, `hp`, `maxHp`, `atk`, `range`, `cooldown`. Um inimigo deve conter: `id`, `x`, `y`, `hp`, `maxHp`, `atk`, `speed`."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(entities): define data structures for party members and enemies"
  git tag -a v0.3.0 -m "Estrutura de dados das entidades de jogo"
  ```

### 🎴 CARD-07: Inimigos Básicos e Perseguição da Fila

* **Objetivo:** Fazer inimigos surgirem nas bordas do mapa e perseguirem o membro mais próximo da fila.

* **Prompt para Copilot:**

  > "Crie uma lógica para gerar 3 inimigos nas bordas externas do Canvas. A cada frame, cada inimigo deve calcular o vetor de direção em relação ao membro da fila mais próximo e se mover em sua direção a uma velocidade constante."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(ai): spawn simple enemies and implement targeted follow movement"
  git tag -a v0.3.1 -m "Inimigos basicos com IA de perseguicao"
  ```

### 🎴 CARD-08: Detecção de Colisão Circunferencial / Caixas

* **Objetivo:** Criar função utilitária para testar colisão entre duas entidades.

* **Prompt para Copilot:**

  > "Implemente uma função utilitária `checkCollision(entityA, entityB)` que verifique colisão por distância euclidiana (círculo contra círculo) usando a fórmula $\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} \le r_1 + r_2$."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(physics): implement circular distance collision detection utility"
  git tag -a v0.3.2 -m "Utilitario de deteccao de colisao"
  ```

### 🎴 CARD-09: Sistema de Dano Individual e Barra de Vida

* **Objetivo:** Aplicar dano quando o inimigo encostar em qualquer membro da fila e desenhar barra de vida (HP bar) acima de cada um.

* **Prompt para Copilot:**

  > "Quando um inimigo colidir com um membro da fila, aplique dano contínuo ou com invulnerabilidade temporária (cooldown de dano de 0.5s). Desenhe uma mini barra de HP verde/vermelha acima da cabeça de cada herói e inimigo no Canvas."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(combat): implement individual hit points damage and overhead health bars"
  git tag -a v0.4.0 -m "Sistema de dano individual e barras de vida"
  ```

### 🎴 CARD-10: Morte de Personagem e Remoção Dinâmica da Fila

* **Objetivo:** Remover membros da fila quando HP chegar a zero. Se o líder morrer, disparar Game Over.

* **Prompt para Copilot:**

  > "Adicione verificação de morte: se o HP de um seguidor zerar, remova-o da lista da fila ajustando os índices dos demais sem interromper o movimento. Se o HP do Líder zerar, pare o game loop e acione o estado de Game Over."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(combat): handle member death, queue recalculation, and game over on leader death"
  git tag -a v0.4.1 -m "Morte de membros e tela de Game Over"
  ```

---

## 🔮 FASE 3: Classes Especiais e Habilidades Ativas/Passivas

### 🎴 CARD-11: Classe Guerreiro (Líder / Tank)

* **Objetivo:** Configurar atributos do Guerreiro com alta resistência e ataque melee de curto alcance.

* **Prompt para Copilot:**

  > "Implemente a classe `Guerreiro` como classe padrão do líder. O guerreiro possui HP elevado (200), reduz 20% do dano recebido (passiva) e realiza um ataque circular de curto alcance golpeando inimigos próximos a cada 1 segundo."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(classes): implement Warrior class with high HP and melee sweep attack"
  git tag -a v0.5.0 -m "Implementacao da classe Guerreiro"
  ```

### 🎴 CARD-12: Classe Bruxa de Gelo (Controle & Lentidão)

* **Objetivo:** Bruxa de Gelo dispara projéteis que desaceleram inimigos.

* **Prompt para Copilot:**

  > "Crie a classe `Bruxa de Gelo`. A cada 1.5 segundos, ela dispara um projétil de gelo no inimigo mais próximo. Ao atingir o inimigo, causa dano leve e reduz a velocidade de movimento do inimigo em 50% por 3 segundos."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(classes): add Ice Witch class with freezing projectile and slow effect"
  git tag -a v0.5.1 -m "Implementacao da classe Bruxa de Gelo"
  ```

### 🎴 CARD-13: Classe Druida (Suporte / Cura de Aliados)

* **Objetivo:** Druida identifica aliados feridos e lança pulsos de cura.

* **Prompt para Copilot:**

  > "Crie a classe `Druida`. A cada 2 segundos, o Druida procura o membro da fila com a menor porcentagem de vida. Se o HP estiver abaixo de 100%, restaura 25 pontos de HP e desenha uma aura verde rápida sobre o aliado curado."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(classes): add Druid class with auto-targeting party heal ability"
  git tag -a v0.5.2 -m "Implementacao da classe Druida"
  ```

### 🎴 CARD-14: Classe Mago de Vento (Dispersão / Knockback)

* **Objetivo:** Mago de Vento dispara onda de choque radial empurrando inimigos para longe da fila.

* **Prompt para Copilot:**

  > "Crie a classe `Mago de Vento`. A cada 3 segundos, ele emite uma onda de choque radial expansiva a partir de sua posição. Inimigos dentro do raio da onda tomam dano e são empurrados para longe (knockback vector) por uma distância de 60 pixels."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(classes): add Wind Mage class with area shockwave knockback"
  git tag -a v0.5.3 -m "Implementacao da classe Mago de Vento"
  ```

### 🎴 CARD-15: Classe Necromante (Invocador de Esqueletos)

* **Objetivo:** Necromante invoca lacaios autônomos acumuláveis no mapa.

* **Prompt para Copilot:**

  > "Crie a classe `Necromante`. A cada 15 segundos, o Necromante invoca 1 esqueleto amigável no mapa (sem limite rígido, acumulável). O esqueleto possui vida própria, move-se de forma autônoma atacando o inimigo mais próximo e morre se seu HP zerar."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(classes): add Necromancer class with autonomous skeleton minion spawning"
  git tag -a v0.6.0 -m "Implementacao da classe Necromante e Minions"
  ```

---

## 🪙 FASE 4: Ondas de Inimigos, Drops e Economia

### 🎴 CARD-16: Sistema de Ondas (Waves) e Escalabilidade

* **Objetivo:** Gerenciar waves com contagem regressiva e aumento progressivo de dificuldade.

* **Prompt para Copilot:**

  > "Crie um gerenciador de Ondas (`WaveManager`). A Wave 1 gera 5 inimigos. A cada nova wave, aumente a quantidade em +3 e a vida dos inimigos em +10%. Exiba no topo da tela 'Wave: X' e um contador antes da próxima onda."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(waves): implement wave manager with progressive difficulty and enemy scaling"
  git tag -a v0.7.0 -m "Sistema de Ondas progressivas"
  ```

### 🎴 CARD-17: Sistema de Drops de Moedas

* **Objetivo:** Ao morrer, o inimigo deixa uma moeda no chão.

* **Prompt para Copilot:**

  > "Quando um inimigo for destruído, instancie um objeto de Moeda na posição $(x, y)$ da morte com valor aleatório entre 1 e 5. Desenhe a moeda no Canvas como um pequeno círculo amarelo radiante que permanece por até 10 segundos antes de sumir."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(economy): drop gold coins on enemy death with expiration timer"
  git tag -a v0.7.1 -m "Drop de moedas ao derrotar inimigos"
  ```

### 🎴 CARD-18: Coleta de Moedas e Carteira do Jogador

* **Objetivo:** Coletar moedas ao passar com a fila por cima delas e acumular saldo.

* **Prompt para Copilot:**

  > "Verifique colisão entre qualquer membro da fila e as moedas no chão. Ao colidir, remova a moeda do mapa, toque um efeito de som/animação simples e adicione o valor ao saldo total de ouro do jogador (`coins`). Exiba a contagem de moedas no HUD."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(economy): implement coin pickup collision and player wallet HUD"
  git tag -a v0.7.2 -m "Coleta de moedas e interface de saldo"
  ```

### 🎴 CARD-19: Cap do Tamanho da Fila (Inicial 7 Slots)

* **Objetivo:** Restringir o número máximo de heróis na fila para 7 por padrão.

* **Prompt para Copilot:**

  > "Defina uma variável de estado `maxPartySlots` com valor inicial 7. Impede a adição de novos personagens na fila se `party.length >= maxPartySlots`. Exiba no HUD o indicador do tamanho atual (ex: `Fila: 5/7`)."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(party): enforce party capacity limit of 7 slots with HUD counter"
  git tag -a v0.8.0 -m "Limite de capacidade da fila de herois"
  ```

### 🎴 CARD-20: Loja na Interface (Upgrade de Slots da Fila)

* **Objetivo:** Interface UI para comprar expansão de slots usando as moedas acumuladas.

* **Prompt para Copilot:**

  > "Crie um modal/painel UI de loja acessível por botão ou no final de cada wave. Permita comprar '+1 Slot de Fila' por 50 moedas (aumentando o custo a cada compra). Atualize `maxPartySlots` imediatamente após a confirmação da compra."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(shop): create shop overlay UI to purchase party slot capacity upgrades"
  git tag -a v0.8.1 -m "Loja de melhorias e expansao de slots"
  ```

---

## 🎁 FASE 5: Spawns de Recrutas, Bônus Raros e Polimento

### 🎴 CARD-21: Spawn Aleatório de Heróis Recrutáveis no Mapa

* **Objetivo:** Fazer personagens neutros surgirem no mapa para serem recrutados ao encostar neles.

* **Prompt para Copilot:**

  > "A cada 20 segundos durante uma wave, faça surgir um herói recrutável aleatório em uma posição livre do mapa (classe aleatória: Druida, Bruxa, Mago ou Necromante). Se a fila passar por cima dele e houver slot vago (`party.length < maxPartySlots`), adicione-o ao final da fila."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(spawns): spawn random recruit units on map to join party"
  git tag -a v0.9.0 -m "Spawn e recrutamento de herois pelo mapa"
  ```

### 🎴 CARD-22: Evento de Bônus Raro (Herói Lendário)

* **Objetivo:** Chance rara de surgir um recrutável especial brilhante antes de finalizar a wave.

* **Prompt para Copilot:**

  > "Crie uma chance de 15% por wave de gerar um 'Bônus Raro' (Paladino Dourado) antes do fim da onda. Ele deve ter cor reluzente, triplo do HP normal e aura de dano. Ao ser recrutado, concede 50 moedas instantâneas."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(events): implement rare shiny bonus hero spawn with bonus rewards"
  git tag -a v0.9.1 -m "Evento de Recruta Raro Lendario"
  ```

### 🎴 CARD-23: HUD Final, Game Over e Botão de Reinício

* **Objetivo:** Criar a tela final de derrota e reinício limpo do jogo.

* **Prompt para Copilot:**

  > "Crie uma tela/overlay elegante de Game Over exibindo: Waves Sobrevividas, Total de Inimigos Derrotados e Moedas Coletadas. Adicione um botão 'Jogar Novamente' que resete completamente o estado do jogo (fila, wave, moedas, entidades)."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "feat(ui): complete game over modal with match statistics and restart feature"
  git tag -a v0.9.2 -m "Tela de Game Over e estatisticas da partida"
  ```

### 🎴 CARD-24: Polimento Gráfico e Partículas (Feedback Visual)

* **Objetivo:** Adicionar pequenos efeitos gráficos de explosão de moedas e partículas de acerto.

* **Prompt para Copilot:**

  > "Crie um sistema simples de partículas no Canvas. Ao acertar inimigos ou coletar moedas, gere pequenas partículas coloridas que se dissipam e somem em 0.4s para dar sensação de impacto (juiciness)."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "fx(visuals): add lightweight particle system for hits, heals, and coin collection"
  git tag -a v1.0.0-rc.1 -m "Sistema de Particulas e Feedback Visual"
  ```

### 🎴 CARD-25: Validação Final e Release Versão 1.0.0

* **Objetivo:** Ajustar balanceamento final, atalhos de pause e gerar a tag da primeira release estável.

* **Prompt para Copilot:**

  > "Adicione tecla 'P' ou botão de Pause no topo do Canvas. Revise a limpeza de loops para evitar vazamento de memória e garanta que todas as 5 classes funcionem harmoniosamente sem erros no console."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "chore(release): polish game balance, pause feature, and prepare v1.0.0 release"
  git tag -a v1.0.0 -m "Versao 1.0.0 Final pronta para entrega SENAI"
  ```

---

## 🛠️ FASE 6: Correção de Bugs Críticos (Bugfixes Granulares)

### 🎴 CARD-FIX-01: Colisão com as Bordas do Canvas (Morte Instantânea)

* **Objetivo:** Impedir a travessia das bordas e disparar Game Over ao atingir os limites da tela.

* **Prompt para Copilot:**

  > "Corrija a movimentação do líder para verificar colisão com os limites do Canvas (800x600). Se as coordenadas $(x, y)$ da posição do líder ultrapassarem as bordas da tela ($x \le 0$, $x \ge \text{canvas.width}$, $y \le 0$ ou $y \ge \text{canvas.height}$), acione imediatamente a rotina de encerramento de jogo / Game Over."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "fix(movement): trigger game over when party leader collides with canvas boundaries"
  git tag -a v1.0.1 -m "Bugfix: Colisao do lider com as bordas do Canvas"
  ```

### 🎴 CARD-FIX-02: Integridade e Espaçamento da Fila (Snake Movement)

* **Objetivo:** Garantir que o histórico de posições mantenha a fila unida de forma contínua sem quebras nem separações.

* **Prompt para Copilot:**

  > "Refatore a leitura do `positionHistory` para os seguidores. Garanta que a posição de cada membro com índice $i$ na fila seja extraída estritamente do índice $i \times \text{spacing}$ no histórico de coordenadas passadas do líder, mantendo o espaçamento constante e impedindo o descolamento ou quebra da fila."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "fix(movement): enforce strict position history indexing for unbroken snake line"
  git tag -a v1.0.2 -m "Bugfix: Integridade e espacamento continuo da fila"
  ```

### 🎴 CARD-FIX-03: Desacoplamento do Recebimento de Dano e Movimentação

* **Objetivo:** Fazer os heróis continuarem se movendo normalmente ao tomar dano, sendo removidos apenas com HP zero.

* **Prompt para Copilot:**

  > "Desacople a lógica de receber dano da rotina de atualização de posição dos personagens. Quando um herói da fila sofrer dano de um inimigo, apenas deduza seu HP e aplique um efeito pisca/hit visual contínuo, sem pausar seu movimento, congelá-lo ou desvinculá-lo da fila. O herói só deve ser removido do array `party` quando seu `hp <= 0`."

* **Comando Git:**

  ```bash
  git add .
  git commit -m "fix(combat): prevent character freezing on hit and remove only when hp reaches zero"
  git tag -a v1.0.3 -m "Bugfix: Dano sem congelamento e remocao apenas com HP zero"
  ```

---

## 📊 Tabela de Verificação de Tags e Versões

| Tag | Escopo da Entrega | 
| ----- | ----- | 
| `v0.1.0` - `v0.2.1` | Setup do Projeto React, Loop de Animação Canvas e Movimento Snake | 
| `v0.3.0` - `v0.4.1` | Entidades, IA dos Inimigos, Colisão, HP e Morte de Personagens | 
| `v0.5.0` - `v0.6.0` | Classes Habilidade: Guerreiro, Bruxa, Druida, Mago de Vento e Necromante | 
| `v0.7.0` - `v0.8.1` | Ondas de Inimigos, Moedas, Carteira e Loja de Slots de Fila | 
| `v0.9.0` - `v0.9.2` | Recrutamento no Mapa, Bônus Raros e HUD de Game Over | 
| `v1.0.0` | Polimento Visual, Partículas e Release Final para o SENAI | 
| `v1.0.1` - `v1.0.3` | Correção de Bugs Críticos: Bordas da Tela, Fila Unida e Dano de HP | 
