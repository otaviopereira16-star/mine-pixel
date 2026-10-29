let steve;
let tiros = [];
let inimigos = [];
let pontuacao = 100; // MUDANÇA: Começa com 100 pontos (sua vida)
let gameOver = false;
let ultimoTiro = 0; 
let totalTirosDisparados = 0;

// SISTEMA DE VELOCIDADE DINÂMICA
let cooldownAtual = 350; 
const COOPEN_MINIMO = 80; 

function setup() {
  createCanvas(600, 600);
  steve = new Steve();
}

function draw() {
  desenharMundoMinecraft(); 
  
  if (gameOver) {
    exibirTelaGameOver();
    return;
  }

  // ATUALIZA O COOLDOWN COM BASE NOS PONTOS ATUAIS
  let bonusVelocidade = floor(pontuacao / 100) * 40;
  cooldownAtual = max(350 - bonusVelocidade, COOPEN_MINIMO);

  steve.update();
  steve.display();

  // Gerencia as flechas
  for (let i = tiros.length - 1; i >= 0; i--) {
    let tiro = tiros[i];
    tiro.update();
    tiro.display();
    
    if (tiro.foraDaTela()) {
      tiros.splice(i, 1);
      continue;
    }

    // Checa colisão com inimigos
    for (let j = inimigos.length - 1; j >= 0; j--) {
      if (tiro.colideCom(inimigos[j])) {
        inimigos.splice(j, 1);
        pontuacao += 10; // MUDANÇA: Ganha 10 pontos ao matar
        
        if (!tiro.comFogo) {
          tiros.splice(i, 1);
          break; 
        }
      }
    }
  }

  // Gera novos inimigos
  if (frameCount % 60 === 0) { 
    inimigos.push(new Inimigo());
  }

  // Gerencia os inimigos
  for (let i = inimigos.length - 1; i >= 0; i--) {
    inimigos[i].update();
    inimigos[i].display();

    // MUDANÇA: Se passar do fundo OU colidir com o Steve, perde 10 pontos e some
    if (inimigos[i].passouDoFundo() || inimigos[i].colideComSteve(steve)) {
      pontuacao -= 10; 
      inimigos.splice(i, 1); 
      
      // Se os pontos zerarem ou ficarem negativos, aí sim é Game Over
      if (pontuacao <= 0) {
        gameOver = true;
      }
    }
  }

  // INTERFACE DE PONTOS / VIDA
  // Muda a cor do texto para vermelho se a vida estiver muito baixa
  if (pontuacao <= 30) {
    fill(255, 50, 50);
  } else {
    fill(255);
  }
  stroke(0);
  strokeWeight(3); 
  textSize(22);
  textAlign(LEFT);
  text("Pontos (Vida): " + pontuacao, 20, 40);
  
  // Exibe a velocidade atual do tiro
  textSize(14);
  fill(100, 255, 100);
  let nivelVelocidade = max(1, floor(pontuacao / 100) + 1);
  text("Velocidade do Arco: Nível " + nivelVelocidade, 20, 110);
  
  // Interface do tiro especial
  fill(0, 150);
  rect(20, 55, 140, 25, 4);
  if (totalTirosDisparados >= 3) {
    fill(255, 100, 0);
    textSize(14);
    text("ESPECIAL PRONTO!", 25, 72);
  } else {
    fill(200);
    textSize(14);
    text("Carga: " + totalTirosDisparados + " / 3", 25, 72);
  }
  noStroke();
}

function desenharMundoMinecraft() {
  background(120, 180, 255);
  noStroke();
  
  fill(255, 255, 180);
  rect(450, 40, 60, 60);
  
  fill(255, 255, 255, 200);
  rect(50, 80, 120, 30);
  rect(90, 65, 80, 20);
  rect(300, 120, 160, 35);
  
  fill(34, 110, 50);
  rect(0, 420, 180, 180);
  rect(140, 450, 200, 150);
  rect(450, 400, 150, 200);
  
  fill(50, 150, 65);
  rect(0, 480, 250, 120);
  rect(200, 500, 300, 100);
  rect(400, 460, 200, 140);
  
  fill(130, 85, 45); 
  rect(0, 560, width, 40);
  fill(85, 175, 55); 
  rect(0, 560, width, 12);
}

function keyPressed() {
  if (gameOver) {
    if (key === ' ') {
      reiniciarJogo();
    }
  } else {
    if (key === ' ' && (millis() - ultimoTiro > cooldownAtual)) {
      if (totalTirosDisparados >= 3) {
        tiros.push(new Arrow(steve.x + steve.tamanho / 2, steve.y, true));
        totalTirosDisparados = 0;
      } else {
        tiros.push(new Arrow(steve.x + steve.tamanho / 2, steve.y, false));
        totalTirosDisparados += 1;
      }
      ultimoTiro = millis();
    }
  }
}

function mousePressed() {
  if (gameOver) {
    reiniciarJogo();
  }
}

function reiniciarJogo() {
  tiros = [];
  inimigos = [];
  pontuacao = 100; // MUDANÇA: Reinicia com 100 pontos
  totalTirosDisparados = 0;
  cooldownAtual = 350; 
  gameOver = false;
  steve = new Steve();
}

function exibirTelaGameOver() {
  background(0, 0, 0, 180);
  fill(255, 50, 50);
  stroke(0);
  strokeWeight(4);
  textSize(45);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 40);
  
  fill(255);
  strokeWeight(2);
  textSize(22);
  text("Seus pontos zeraram!", width / 2, height / 2 + 10);
  text("Clique ou ESPAÇO para reiniciar", width / 2, height / 2 + 50);
  noStroke();
}

class Steve {
  constructor() {
    this.tamanho = 40;
    this.x = 280; 
    this.y = 480; 
    this.velocidade = 5; 
  }

  display() {
    stroke(0, 50);
    strokeWeight(1);
    fill(0, 150, 200);
    rect(this.x, this.y + 10, this.tamanho, this.tamanho - 10);
    fill(215, 160, 120);
    rect(this.x + 8, this.y - 10, this.tamanho - 16, 20);
    fill(80, 50, 30);
    rect(this.x + 8, this.y - 10, this.tamanho - 16, 6);
    noStroke();
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= this.velocidade;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.velocidade;
    }
    if (keyIsDown(UP_ARROW)) {
      this.y -= this.velocidade;
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.y += this.velocidade;
    }

    this.x = constrain(this.x, 0, width - this.tamanho);
    this.y = constrain(this.y, 0, height - this.tamanho - 40);
  }
}

class Arrow {
  constructor(x, y, comFogo) {
    this.x = x;
    this.y = y;
    this.velY = -9; 
    this.comFogo = comFogo;
    this.particulasFogo = [];
  }

  display() {
    if (this.comFogo) {
      if (frameCount % 2 === 0) {
        this.particulasFogo.push({
          x: this.x + random(-4, 4),
          y: this.y + 10 + random(0, 10),
          tamanho: random(6, 12),
          cor: random(['#ff3300', '#ff6600', '#ffaa00']),
          vida: 255
        });
      }

      for (let i = this.particulasFogo.length - 1; i >= 0; i--) {
        let p = this.particulasFogo[i];
        fill(p.cor);
        noStroke();
        rect(p.x - p.tamanho / 2, p.y - p.tamanho / 2, p.tamanho, p.tamanho);
        p.y += 1;
        p.vida -= 15;
        if (p.vida <= 0) {
          this.particulasFogo.splice(i, 1);
        }
      }
    }

    noStroke();
    fill(130, 130, 130);
    quad(this.x, this.y, this.x + 3, this.y + 4, this.x, this.y + 6, this.x - 3, this.y + 4);
    fill(150, 100, 50);
    rect(this.x - 1, this.y + 6, 2, 14);
    fill(220, 220, 220);
    rect(this.x - 3, this.y + 18, 6, 3);
    rect(this.x - 2, this.y + 21, 4, 3);
  }

  update() {
    this.y += this.velY;
  }

  foraDaTela() {
    return this.y < -30;
  }

  colideCom(inimigo) {
    let d = dist(this.x, this.y, inimigo.x + inimigo.tamanho/2, inimigo.y + inimigo.tamanho/2);
    return d < (inimigo.tamanho / 2) + 3;
  }
}

class Inimigo {
  constructor() {
    this.tamanho = 36;
    this.x = random(0, 560); 
    this.y = -this.tamanho;
    
    let velocidadeBase = random(0.8, 1.8);
    let dificuldadeExtra = floor(pontuacao / 100) * 0.2; 
    
    this.velocidade = velocidadeBase + dificuldadeExtra;
    this.tipo = random(['zumbi', 'creeper', 'esqueleto']);
  }

  display() {
    stroke(0, 40);
    strokeWeight(1);
    if (this.tipo === 'zumbi') {
      fill(50, 120, 60); 
      rect(this.x, this.y, this.tamanho, this.tamanho);
      fill(30, 50, 150); 
      rect(this.x, this.y + 26, this.tamanho, 10);
    } 
    else if (this.tipo === 'creeper') {
      fill(30, 200, 50); 
      rect(this.x, this.y, this.tamanho, this.tamanho);
      fill(0); 
      rect(this.x + 8, this.y + 12, 6, 6); 
      rect(this.x + 22, this.y + 12, 6, 6); 
      rect(this.x + 14, this.y + 18, 8, 12); 
    } 
    else if (this.tipo === 'esqueleto') {
      fill(200, 200, 200); 
      rect(this.x, this.y, this.tamanho, this.tamanho);
      fill(50); 
      rect(this.x + 6, this.y + 10, 6, 4);
      rect(this.x + 24, this.y + 10, 6, 4);
    }
    noStroke();
  }

  update() {
    this.y += this.velocidade;
  }

  passouDoFundo() {
    return this.y > height;
  }

  colideComSteve(steve) {
    return (this.x < steve.x + steve.tamanho &&
            this.x + this.tamanho > steve.x &&
            this.y < steve.y + steve.tamanho &&
            this.y + this.tamanho > steve.y);
  }
}
