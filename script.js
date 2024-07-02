const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// テトリスの盤面のサイズ
const columns = 10;
const rows = 20;

// ブロックのサイズ
const blockSize = 20;

// テトリスの盤面を二次元配列で表現
let board = Array.from({ length: rows }, () => Array(columns).fill(0));

// テトリミノの形と色を定義
const tetrominoes = [
  { // I
    shapes: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'cyan'
  },
  { // J
    shapes: [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0]
    ],
    color: 'blue'
  },
  { // L
    shapes: [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0]
    ],
    color: 'orange'
  },
  { // O
    shapes: [
      [4, 4],
      [4, 4]
    ],
    color: 'yellow'
  },
  { // S
    shapes: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0]
    ],
    color: 'green'
  },
  { // T
    shapes: [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0]
    ],
    color: 'purple'
  },
  { // Z
    shapes: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ],
    color: 'red'
  }
];

// ゲームの状態
let gameOver = false;

// 操作中のテトリミノ
let currentTetromino = getRandomTetromino();

// 次に表示するテトリミノ
let nextTetromino = getRandomTetromino();

// スコア
let score = 0;

// ランダムなテトリミノを生成する関数
function getRandomTetromino() {
  const index = Math.floor(Math.random() * tetrominoes.length);
  return { ...tetrominoes[index], x: 4, y: 0 }; // 初期位置を設定
}

// テトリミノを描画する関数
function drawTetromino(tetromino) {
  tetromino.shapes.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value > 0) {
        drawBlock(tetromino.x + x, tetromino.y + y, tetromino.color);
      }
    });
  });
}

// ブロックを描画する関数
function drawBlock(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  context.strokeStyle = 'black';
  context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

// 盤面を描画する関数
function drawBoard() {
  // 盤面の背景のみを塗りつぶす
  context.fillStyle = 'white';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value > 0) {
        drawBlock(x, y, tetrominoes[value - 1].color);
      }
    });
  });
}

// ゲームオーバーの判定
function checkGameOver() {
  for (let x = 0; x < columns; x++) {
    if (board[0][x] > 0) {
      gameOver = true;
    }
  }
}

// 行が揃っているかチェックし、揃っていたら消す関数
function checkLineClear() {
  let completedLines = 0;
  for (let y = 0; y < rows; y++) {
    let isLineComplete = true;
    for (let x = 0; x < columns; x++) {
      if (board[y][x] === 0) {
        isLineComplete = false;
        break;
      }
    }
    if (isLineComplete) {
      // 行が揃っていたら、その行を消す
      board.splice(y, 1); // y行目を削除
      board.unshift(Array(columns).fill(0)); // 先頭に空の行を追加
      completedLines++;
    }
  }

  // スコアの更新
  if (completedLines > 0) {
    score += 100 * completedLines * completedLines; // 複数行同時消しでボーナス
  }
}

// テトリミノを回転させる関数
function rotateTetromino() {
  let newShapes = [];
  for (let i = 0; i < currentTetromino.shapes[0].length; i++) {
    let newRow = [];
    for (let j = currentTetromino.shapes.length - 1; j >= 0; j--) {
      newRow.push(currentTetromino.shapes[j][i]);
    }
    newShapes.push(newRow);
  }

  // 回転後のテトリミノが盤面からはみ出さないか、他のブロックと重ならないかチェック
  if (canMoveTetromino(currentTetromino.x, currentTetromino.y, newShapes)) {
    currentTetromino.shapes = newShapes;
  }
}

// テトリミノが移動可能かどうかチェックする関数
function canMoveTetromino(x, y, shapes) {
  for (let row = 0; row < shapes.length; row++) {
    for (let col = 0; col < shapes[row].length; col++) {
      if (shapes[row][col] > 0) { // ブロックが存在する場合
        let newX = x + col;
        let newY = y + row;
        if (newX < 0 || newX >= columns || newY >= rows) {
          return false; // 盤面からはみ出す場合
        }
        if (newY < 0) {
          continue; // まだ表示されていない部分は無視
        }
        if (board[newY][newX] > 0) {
          return false; // 他のブロックと重なる場合
        }
      }
    }
  }
  return true; // 移動可能
}

// テトリミノを下に動かす関数
function moveTetrominoDown() {
  if (canMoveTetromino(currentTetromino.x, currentTetromino.y + 1, currentTetromino.shapes)) {
    currentTetromino.y++;
  } else {
    // テトリミノが着地したら、盤面に固定する
    fixTetromino();
  }
}

// テトリミノを左右に動かす関数
function moveTetrominoHorizontal(direction) {
  if (canMoveTetromino(currentTetromino.x + direction, currentTetromino.y, currentTetromino.shapes)) {
    currentTetromino.x += direction;
  }
}

// テトリミノを盤面に固定する関数
function fixTetromino() {
  for (let row = 0; row < currentTetromino.shapes.length; row++) {
    for (let col = 0; col < currentTetromino.shapes[row].length; col++) {
      if (currentTetromino.shapes[row][col] > 0) {
        let x = currentTetromino.x + col;
        let y = currentTetromino.y + row;
        if (y >= 0) { // 画面内に表示されている場合のみ
          board[y][x] = tetrominoes.findIndex(t => t.color === currentTetromino.color) + 1; // テトリミノの種類を記録
        }
      }
    }
  }

  // 新しいテトリミノを生成する前にライン消去チェックとゲームオーバーチェックを行う
  checkLineClear();
  checkGameOver();

  // 新しいテトリミノを生成
  currentTetromino = nextTetromino;
  nextTetromino = getRandomTetromino();
}

// ゲームの初期化
function init() {
  board = Array.from({ length: rows }, () => Array(columns).fill(0));
  currentTetromino = getRandomTetromino();
  nextTetromino = getRandomTetromino();
  score = 0;
  gameOver = false;
}

// ゲームの更新
function update() {
  if (!gameOver) {
    // 盤面とテトリミノを描画
    drawBoard();
    drawTetromino(currentTetromino);
    
    // テトリミノを動かす
    moveTetrominoDown();
  } else {
    // ゲームオーバーの表示
    context.font = '24px Arial';
    context.fillStyle = 'red';
    context.fillText('Game Over', 10, canvas.height / 2);
  }
}

// キーボード入力
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      moveTetrominoHorizontal(-1);
      break;
    case 'ArrowRight':
      moveTetrominoHorizontal(1);
      break;
    case 'ArrowDown':
      moveTetrominoDown();
      break;
    case 'ArrowUp':
      rotateTetromino();
      break;
  }
});

// ゲームループ
init();
setInterval(update, 500); // 0.5秒ごとに更新 (高速化)
