const readline = require('readline-sync');
const BOX_HEIGHT = 4; //unit of measurement: lines in console
const BOX_LENGTH = 9; //unit of measurement: characters
const NUM_OF_BOXES = 9;
const BOXES_PER_ROW = 3;
const HORIZ_LINE = '-'.repeat((BOX_LENGTH + 1) * BOXES_PER_ROW);
const MARKS = {
  user: ['   \\ /   ', '   / \\   '],
  computer: ['   /¯\\   ', '   \\_/   ']
};
const WINNING_COMBOS = [
  ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'],
  ['1', '4', '7'], ['2', '5', '8'], ['3', '6', '9'],
  ['1', '5', '9'], ['3', '5', '7']];
const MESSAGES = {
  goFirst: '> Who do you want to go first? (user/computer/random)\n',
  goFirstInvalid: '> Invalid entry. Enter "user" "computer" or "random":\n',
  userTurn: '> Your move. Enter a box number:\n',
  userTurnInvalid: `> Invalid entry. Enter the number of an available square.\n`,
  playAgain: 'Play again? (y/n)\n',
  playAgainInvalid: 'Invalid entry. Enter "y" or "n":\n'
};

function prompt(text) {
  console.log(`> ${text}`);
}

function getWhoGoesFirst() {
  let input = readline.question(MESSAGES.goFirst);
  while (isInvalidFirst(input)) {
    input = readline.question(MESSAGES.goFirstInvalid);
  }

  if (input === 'random') {
    return ['user', 'computer'][Math.round(Math.random())];
  } else {
    return input.toLowerCase();
  }
}

function isInvalidFirst (string) {
  return (
    string.toLowerCase() !== 'user' &&
    string.toLowerCase() !== 'computer' &&
    string.toLowerCase() !== 'random'
  );
}

function getEmptyBoard() {
  let board = {};
  for (let box = 1; box <= NUM_OF_BOXES; box += 1) {
    board[box] = [
      BOX_ID_STR(box),
      ' '.repeat(BOX_LENGTH),
      ' '.repeat(BOX_LENGTH),
      ' '.repeat(BOX_LENGTH)];
  }
  return board;
}

function displayBoard(board) {
  console.clear();
  for (
    let firstBoxThisRow = 1;
    firstBoxThisRow < NUM_OF_BOXES;
    firstBoxThisRow += BOXES_PER_ROW
  ) {
    displayRow(firstBoxThisRow, board);
  }
}

function displayRow(firstBox, board) {
  for (let lineThisRow = 0; lineThisRow < BOX_HEIGHT; lineThisRow += 1) {
    displayLine(firstBox, board, lineThisRow);
  }
  console.log(HORIZ_LINE);
}

function displayLine(firstBox, board, lineNum) {
  let str = ``;
  for (
    let currBox = firstBox;
    currBox < firstBox + BOXES_PER_ROW;
    currBox += 1
  ) {
    str += `${board[currBox][lineNum]}|`;
  }
  console.log(str);
}

function BOX_ID_STR(boxID) {
  if (String(boxID).length === 2) {
    return boxID + ' '.repeat(BOX_LENGTH - 2);
  } else {
    return boxID + ' '.repeat(BOX_LENGTH - 1);
  }
}

function isGameOver(board) {
  return (
    isWinner(board, 'user') ||
    isWinner(board, 'computer') ||
    isBoardFull(board)
  );
}

function isWinner(board, player) {
  return (
    WINNING_COMBOS.some(combo => {
      let [sq1, sq2, sq3] = combo;
      return (
        MARKS[player][0] === board[sq1][1] &&
        MARKS[player][0] === board[sq2][1] &&
        MARKS[player][0] === board[sq3][1]
      );
    })
  );
}

function isBoardFull(board) {
  let boardArr = Object.keys(board);
  return boardArr.every(boxNum => isBoxClaimed(board, boxNum));
}

function userTakesTurn(board) {
  let input = readline.question(MESSAGES.userTurn);
  while (isInvalidMove(input, board)) {
    input = readline.question(MESSAGES.userTurnInvalid);
  }
  markDownMove(board, input, 'user');
}

function isInvalidMove (string, board) {
  return (
    Number.isNaN(parseFloat(string)) ||
    !Number.isInteger(parseFloat(string)) ||
    parseFloat(string) <= 0 ||
    parseFloat(string) > 9 ||
    isBoxClaimed(board, string)
  );
}

function markDownMove(board, box, player) {
  board[box][0] = ' '.repeat(BOX_LENGTH);
  board[box][1] = MARKS[player][0];
  board[box][2] = MARKS[player][1];
}

function computerTakesTurn(board) {
  let move = '';
  let potentialUserWin = getPotentialWin(board, 'user');
  let potentialCompWin = getPotentialWin(board, 'computer');

  if (potentialUserWin !== 'none') {
    move = potentialUserWin;
  } else if (potentialCompWin !== 'none') {
    move = potentialCompWin;
  } else if (!isBoxClaimed(board, '5')) {
    move = '5';
  } else {
    move = randomMove(board);
  }

  markDownMove(board, move, 'computer');
  console.clear();
  displayBoard(board);
}

function randomMove(board) {
  let boxesArr = Object.keys(board);
  let availableBoxes = boxesArr.filter(box => !isBoxClaimed(board, box));
  let randomIndex = Math.floor(Math.random() * availableBoxes.length);
  let randomBoxNum = availableBoxes[randomIndex];
  return randomBoxNum;
}

function getPotentialWin(board, player) {
  let potentialWin = WINNING_COMBOS.find(combo =>
    isTwoMineOneFree(combo, board, player));

  if (potentialWin === undefined) {
    return 'none';
  } else {
    return potentialWin.find(box => !isBoxClaimed(board, box));
  }
}

function isTwoMineOneFree(combo, board, player) {
  let numOfClaimed = combo.filter(box => isBoxClaimed(board, box, player));
  let numAvail = combo.filter(box => !isBoxClaimed(board, box));
  return numOfClaimed.length === 2 && numAvail.length === 1;
}

function isBoxClaimed(board, boxNum, player = undefined) {
  if (player === undefined) {
    return (
      board[boxNum][1] === MARKS['computer'][0] ||
      board[boxNum][1] === MARKS['user'][0]
    );
  } else {
    return board[boxNum][1] === MARKS[player][0];
  }
}

function change(player) {
  return player === 'user' ? 'computer' : 'user';
}

function displayWinner(board) {
  if (isWinner(board, 'user')) {
    prompt('You win!');
  } else if (isWinner(board, 'computer')) {
    prompt('You lose :(');
  } else if (isBoardFull(board)) {
    prompt ('Tie game!');
  }
}

function getPlayAgain() {
  let input = readline.question(MESSAGES.playAgain);
  while (isInvalidYN(input)) {
    input = readline.question(MESSAGES.playAgainInvalid);
  }
  if (['y', 'yes'].includes(input.toLowerCase())) {
    console.clear();
    return true;
  } else {
    return false;
  }
}

function isInvalidYN (string) {
  return (
    !['y', 'yes'].includes(string.toLowerCase()) &&
    !['n', 'no'].includes(string.toLowerCase())
  );
}


//BEGIN GAME
console.clear();

prompt('Welcome to Tic Tac Toe!');
let isUserPlaying = true;

while (isUserPlaying) {
  let whosTurn = getWhoGoesFirst();
  let board = getEmptyBoard();

  while (!isGameOver(board)) {
    displayBoard(board);
    if (whosTurn === 'user') {
      userTakesTurn(board);
    } else if (whosTurn === 'computer') {
      computerTakesTurn(board);
    }
    whosTurn = change(whosTurn);
  }

  displayBoard(board);
  displayWinner(board);
  isUserPlaying = getPlayAgain();
}

prompt('Goodbye!');