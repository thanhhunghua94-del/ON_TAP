// =====================================================
// 1. CHUYỂN TAB
// =====================================================
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    // toggle(tên class, điều kiện): bật class nếu điều kiện đúng, tắt nếu sai
    tabs.forEach((t) => t.classList.toggle('active', t === tab));
    panels.forEach((p) => p.classList.toggle('active', p.id === tab.dataset.tab));
  });
});

// =====================================================
// 2. ĐỒNG HỒ TẬP TRUNG (Pomodoro)
// =====================================================
const ringBar = document.getElementById('ringBar');
const timeText = document.getElementById('timeText');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionCountEl = document.getElementById('sessionCount');
const modeButtons = document.querySelectorAll('.mode');

// Chu vi vòng tròn = 2 × π × bán kính (r = 54 trong HTML)
const RING_LENGTH = 2 * Math.PI * 54;
ringBar.style.strokeDasharray = RING_LENGTH;

let totalSeconds = 25 * 60; // tổng thời gian của chế độ hiện tại
let secondsLeft = totalSeconds;
let timerId = null;         // null = đang dừng
let sessions = 0;

// Cập nhật chữ số và vòng tròn
function drawTimer() {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  timeText.textContent = minutes + ':' + seconds;
  document.title = minutes + ':' + seconds + ' · Góc Học Tập';

  // Phần vòng tròn còn lại tỉ lệ với thời gian còn lại
  ringBar.style.strokeDashoffset = RING_LENGTH * (1 - secondsLeft / totalSeconds);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function toggleTimer() {
  if (timerId) {                       // đang chạy -> tạm dừng
    stopTimer();
    startBtn.textContent = 'Tiếp tục';
    return;
  }
  startBtn.textContent = 'Tạm dừng';
  timerId = setInterval(() => {        // chạy lại mỗi 1000ms = 1 giây
    secondsLeft--;
    drawTimer();
    if (secondsLeft <= 0) {
      stopTimer();
      startBtn.textContent = 'Bắt đầu';
      if (totalSeconds === 25 * 60) {  // chỉ tính phiên tập trung 25 phút
        sessions++;
        sessionCountEl.textContent = sessions;
      }
      alert('Hết giờ! Làm tốt lắm 🎉');
    }
  }, 1000);
}

function resetTimer() {
  stopTimer();
  secondsLeft = totalSeconds;
  startBtn.textContent = 'Bắt đầu';
  drawTimer();
}

// Đổi chế độ (Tập trung / Nghỉ ngắn / Nghỉ dài)
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.toggle('active', b === btn));
    totalSeconds = Number(btn.dataset.minutes) * 60;
    resetTimer();
  });
});

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

// =====================================================
// 3. THẺ GHI NHỚ (Flashcards)
// =====================================================
const cards = [
  { q: 'ROE là gì?', a: 'Tỷ suất lợi nhuận trên vốn chủ sở hữu = Lợi nhuận sau thuế / Vốn chủ sở hữu.' },
  { q: 'ROA là gì?', a: 'Tỷ suất lợi nhuận trên tổng tài sản = Lợi nhuận sau thuế / Tổng tài sản.' },
  { q: 'P/E là gì?', a: 'Hệ số giá trên thu nhập = Giá cổ phiếu / EPS. Cho biết nhà đầu tư trả bao nhiêu cho 1 đồng lợi nhuận.' },
  { q: 'EPS là gì?', a: 'Thu nhập trên mỗi cổ phiếu = Lợi nhuận sau thuế / Số cổ phiếu đang lưu hành.' },
  { q: 'Lãi suất kép là gì?', a: 'Lãi được cộng vào vốn, kỳ sau tính lãi trên cả vốn lẫn lãi đã nhận.' },
  { q: 'Tỷ số thanh toán hiện hành?', a: 'Tài sản ngắn hạn / Nợ ngắn hạn. Đo khả năng trả các khoản nợ đến hạn.' },
  { q: 'Tỷ số D/E?', a: 'Nợ phải trả / Vốn chủ sở hữu. Đo mức độ sử dụng đòn bẩy tài chính.' },
  { q: 'Đa dạng hóa danh mục?', a: 'Phân bổ vốn vào nhiều tài sản khác nhau để giảm rủi ro khi một tài sản giảm giá.' }
];

const flipCard = document.getElementById('flipCard');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');
const cardCount = document.getElementById('cardCount');
const progressBar = document.getElementById('progressBar');
const knownBtn = document.getElementById('knownBtn');

let index = 0;               // đang xem thẻ số mấy
const known = new Set();     // Set: tập hợp các thẻ đã thuộc (không bị trùng)

function updateCard() {
  cardFront.textContent = cards[index].q;
  cardBack.textContent = cards[index].a;
  cardCount.textContent = 'Thẻ ' + (index + 1) + '/' + cards.length + ' · Đã thuộc ' + known.size;
  progressBar.style.width = (known.size / cards.length * 100) + '%';
  flipCard.classList.toggle('known', known.has(index));
  knownBtn.textContent = known.has(index) ? '↺ Bỏ đánh dấu' : '✓ Đã thuộc';
}

// Đổi thẻ: lật về mặt trước trước, đợi lật xong mới đổi chữ (để không lộ đáp án)
function goTo(newIndex) {
  const wasFlipped = flipCard.classList.contains('flipped');
  flipCard.classList.remove('flipped');
  index = (newIndex + cards.length) % cards.length; // quay vòng khi hết thẻ
  setTimeout(updateCard, wasFlipped ? 250 : 0);
}

function toggleFlip() {
  flipCard.classList.toggle('flipped');
}

flipCard.addEventListener('click', toggleFlip);
document.getElementById('prevBtn').addEventListener('click', () => goTo(index - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(index + 1));

knownBtn.addEventListener('click', () => {
  if (known.has(index)) known.delete(index);
  else known.add(index);
  updateCard();
});

// =====================================================
// 4. PHÍM TẮT
// =====================================================
document.addEventListener('keydown', (event) => {
  const onCardsTab = document.getElementById('cards').classList.contains('active');

  // Space = bắt đầu/tạm dừng (chỉ khi không đang focus vào nút nào, tránh bị kích hoạt 2 lần)
  if (event.code === 'Space' && event.target === document.body) {
    event.preventDefault();
    toggleTimer();
  }
  if (onCardsTab && event.key === 'ArrowRight') goTo(index + 1);
  if (onCardsTab && event.key === 'ArrowLeft') goTo(index - 1);
  if (onCardsTab && event.key === 'Enter' && event.target === flipCard) toggleFlip();
});

// =====================================================
// 5. KHỞI TẠO
// =====================================================
drawTimer();
updateCard();

// =====================================================
// 6. TRẮC NGHIỆM + TẢI BÀI LÊN
// =====================================================
const setSelect = document.getElementById('setSelect');
const deleteSetBtn = document.getElementById('deleteSetBtn');
const quizBar = document.getElementById('quizBar');
const quizCount = document.getElementById('quizCount');
const quizBody = document.getElementById('quizBody');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizNextBtn = document.getElementById('quizNextBtn');
const quizResult = document.getElementById('quizResult');
const quizScore = document.getElementById('quizScore');
const quizComment = document.getElementById('quizComment');
const fileInput = document.getElementById('fileInput');
const uploadMsg = document.getElementById('uploadMsg');
const limitInput = document.getElementById('limitInput');
const shuffleInput = document.getElementById('shuffleInput');

// Bộ đề có sẵn để thử ngay
const sampleSet = {
  name: 'Mẫu: Tài chính cơ bản',
  builtin: true,
  questions: [
    { q: 'ROE được tính bằng công thức nào?', options: ['Lợi nhuận sau thuế / Vốn chủ sở hữu', 'Lợi nhuận sau thuế / Tổng tài sản', 'Doanh thu / Tổng tài sản', 'Nợ phải trả / Vốn chủ sở hữu'], answer: 0 },
    { q: 'Tỷ số D/E đo lường điều gì?', options: ['Khả năng sinh lời', 'Mức độ sử dụng đòn bẩy tài chính', 'Khả năng thanh toán nhanh', 'Vòng quay hàng tồn kho'], answer: 1 },
    { q: 'P/E cao thường cho thấy điều gì?', options: ['Cổ phiếu chắc chắn bị định giá thấp', 'Công ty sắp phá sản', 'Nhà đầu tư kỳ vọng tăng trưởng cao', 'Công ty không có lợi nhuận'], answer: 2 },
    { q: 'Lãi kép khác lãi đơn ở điểm nào?', options: ['Lãi suất luôn cao hơn', 'Lãi được cộng vào vốn để sinh lãi tiếp', 'Chỉ áp dụng cho nợ', 'Chỉ tính một lần'], answer: 1 },
    { q: 'Đa dạng hóa danh mục nhằm mục đích gì?', options: ['Tăng chắc chắn lợi nhuận', 'Tránh đóng thuế', 'Giảm chi phí giao dịch', 'Giảm rủi ro khi một tài sản giảm giá'], answer: 3 }
  ]
};

// Bộ đề người dùng tải lên được lưu trong localStorage để lần sau còn
function loadUploadedSets() {
  try { return JSON.parse(localStorage.getItem('quizSets')) || []; } catch (e) { return []; }
}
function saveUploadedSets() {
  try { localStorage.setItem('quizSets', JSON.stringify(sets.filter(s => !s.builtin))); } catch (e) {}
}

let sets = [sampleSet, ...loadUploadedSets()];
let currentSet = 0, qIndex = 0, score = 0;

// ----- Đọc file: chuyển nội dung file thành mảng câu hỏi -----
function isValid(item) {
  return item.q && item.options.length >= 2 && item.answer >= 0 && item.answer < item.options.length;
}

function parseJson(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.questions;
  return list.map((item) => {
    let answer = item.answer;
    if (typeof answer === 'string') answer = 'ABCD'.indexOf(answer.trim().toUpperCase()); // "B" -> 1
    return { q: String(item.q || item.question || ''), options: (item.options || []).map(String), answer: answer };
  }).filter(isValid);
}

function parseText(text) {
  const questions = [];
  let qLines = [], options = [], letters = [], boldIdx = [], answer = -1, answerLetter = '';

  // Chốt câu đang đọc dở rồi chuẩn bị đọc câu mới.
  // Đáp án lấy theo thứ tự ưu tiên: dòng "Đáp án" > đáp án duy nhất được in đậm.
  function finishQuestion() {
    if (answerLetter) {                       // đáp án ghi bằng chữ cái -> đổi sang vị trí trong danh sách
      const k = letters.indexOf(answerLetter);
      answer = k >= 0 ? k : 'ABCD'.indexOf(answerLetter);
    }
    if (answer < 0 && boldIdx.length === 1) answer = boldIdx[0];
    const item = {
      q: qLines.join(' ')
        .replace(/^((câu hỏi|câu)\s*)?\d+\s*[.:)]\s*/i, '')   // bỏ "Câu 1:" / "1." ở đầu
        .replace(/\(\s*soạn bởi[^)]*\)/i, '')                  // bỏ "(Soạn bởi ...)"
        .trim(),
      options: options,
      answer: answer
    };
    if (isValid(item)) questions.push(item);
    qLines = []; options = []; letters = []; boldIdx = []; answer = -1; answerLetter = '';
  }

  // Đọc lần lượt từng dòng, bỏ qua dòng trống
  const lines = text.normalize('NFC').replace(/\r/g, '').split('\n');

  // Lấy dòng không trống kế tiếp (dùng để nhận ra đáp án "A ..." viết thiếu dấu chấm)
  function nextLine(i) {
    for (let k = i + 1; k < lines.length; k++) {
      const t = lines[k].replace(/\u0001/g, '').trim();
      if (t) return t;
    }
    return '';
  }

  lines.forEach((rawLine, idx) => {
    const bold = rawLine.startsWith('\u0001');            // dòng này có in đậm không
    const line = rawLine.replace(/\u0001/g, '').trim();
    if (!line) return;

    const ans = line.match(/^(đáp án( đúng)?|dap an( dung)?|answer)\s*[:：-]?\s*([A-D])\b/i);
    const inlineAns = options.length >= 2 && line.match(/^([A-D])\s*[(（]/);   // vd: "A ( giải thích )"
    let opt = line.match(/^([A-D])\s*[.)]\s*(.+)$/i);                           // "A. text", "A) text", "A . text"
    if (!opt && /^[A-D]\s+\S/.test(line)) {
      // Đáp án viết thiếu dấu chấm, vd "D 68.2% and 6.6%": chỉ nhận khi đúng thứ tự A, B, C, D.
      // Riêng "A ..." phải có dòng "B ..." ngay sau, để không nhầm với câu hỏi bắt đầu bằng "A company..."
      const letter = line[0];
      const startsList = options.length === 0 && /^B\s*[.)]?\s+\S/.test(nextLine(idx));
      if (letter === 'ABCD'[options.length] && (options.length > 0 || startsList)) {
        opt = [line, letter, line.slice(1).trim()];
      }
    }
    const isNewQuestion = /^((câu hỏi|câu)\s*)?\d+\s*[.:)]/i.test(line);       // "Câu 3:" hoặc "3."

    if (ans || inlineAns) {
      answerLetter = (ans ? ans[4] : inlineAns[1]).toUpperCase();
      finishQuestion();
    } else if (opt) {
      options.push(opt[2]);
      letters.push(opt[1].toUpperCase());
      if (bold) boldIdx.push(options.length - 1);          // nhớ lại đáp án nào đang in đậm
    } else if (isNewQuestion || options.length > 0) {
      if (options.length > 0) finishQuestion();            // câu cũ không có dòng Đáp án -> chốt luôn
      qLines = [line];                                     // bắt đầu câu mới
    } else {
      qLines.push(line);                                   // câu hỏi viết nhiều dòng
    }
  });

  finishQuestion();                                        // câu cuối cùng
  return questions;
}

function showMessage(text, isError) {
  uploadMsg.textContent = text;
  uploadMsg.classList.toggle('error', isError);
}

// Bỏ thẻ HTML và đổi ký tự đặc biệt (&amp; ...) về chữ thường
function htmlToPlain(html) {
  const noTags = html.replace(/<[^>]+>/g, '');
  return new DOMParser().parseFromString(noTags, 'text/html').body.textContent;
}

// Đổi HTML (do mammoth tạo ra) thành chữ thường, giữ lại xuống dòng VÀ đánh dấu dòng in đậm.
// - Trong Word, 4 đáp án thường nằm chung 1 đoạn, ngăn cách bằng Shift+Enter (thẻ <br>).
// - Dòng nào gần như toàn bộ chữ in đậm (thẻ <strong>) sẽ được gắn ký tự \u0001 ở đầu,
//   để parseText biết đó có thể là đáp án đúng.
function htmlToText(html) {
  const countChars = (s) => s.replace(/\s/g, '').length;
  return html
    .replace(/<br\s*\/?>/gi, '\n')            // <br> = xuống dòng
    .replace(/<\/(p|li|h\d)>/gi, '\n')        // hết đoạn = xuống dòng
    .split('\n')
    .map((lineHtml) => {
      const plain = htmlToPlain(lineHtml);
      if (!plain.trim()) return '';
      const boldHtml = (lineHtml.match(/<strong>.*?<\/strong>/gi) || []).join('');
      const isBold = countChars(htmlToPlain(boldHtml)) >= 0.8 * countChars(plain);
      return (isBold ? '\u0001' : '') + plain;
    })
    .join('\n');
}

// Thêm bộ đề mới vào danh sách sau khi đã đọc xong file
function addSet(file, questions) {
  if (questions.length === 0) {
    showMessage('Không đọc được câu hỏi nào. Kiểm tra lại định dạng file mẫu.', true);
    return;
  }
  sets.push({ name: file.name.replace(/\.\w+$/, ''), questions: questions });
  saveUploadedSets();
  currentSet = sets.length - 1;
  renderSetSelect();
  startQuiz();
  showMessage('Đã thêm ' + questions.length + ' câu hỏi từ "' + file.name + '"', false);
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();

  if (name.endsWith('.docx')) {
    // File Word: dùng thư viện mammoth lấy phần chữ ra, rồi đọc như file .txt
    if (typeof mammoth === 'undefined') {
      showMessage('Chưa tải được thư viện đọc Word. Kiểm tra mạng rồi thử lại.', true);
    } else {
      file.arrayBuffer()
        .then((buffer) => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then((result) => addSet(file, parseText(htmlToText(result.value))))
        .catch(() => showMessage('Không đọc được file Word này.', true));
    }
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      addSet(file, name.endsWith('.json') ? parseJson(reader.result) : parseText(reader.result));
    } catch (e) {
      showMessage('File bị lỗi định dạng, không đọc được.', true);
    }
    fileInput.value = ''; // cho phép chọn lại cùng 1 file
  };
  reader.readAsText(file, 'UTF-8');
});

// ----- Hiển thị và làm bài -----
function renderSetSelect() {
  setSelect.innerHTML = '';
  sets.forEach((s, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = s.name + ' (' + s.questions.length + ' câu)';
    setSelect.appendChild(option);
  });
  setSelect.value = currentSet;
  limitInput.value = '';                                       // trống = làm tất cả
  limitInput.placeholder = 'Tất cả ' + sets[currentSet].questions.length;
  deleteSetBtn.hidden = !!sets[currentSet].builtin; // không cho xóa bộ đề mẫu
}

let activeQuestions = []; // các câu sẽ làm trong lần này (đã giới hạn số câu / trộn)

function startQuiz() {
  const all = sets[currentSet].questions;

  // Số câu muốn làm: để trống = tất cả, và không vượt quá số câu có trong bộ đề
  let limit = parseInt(limitInput.value) || all.length;
  limit = Math.max(1, Math.min(limit, all.length));
  if (limitInput.value !== '') limitInput.value = limit;

  const pool = [...all]; // sao chép để không làm đảo thứ tự bộ đề gốc
  if (shuffleInput.checked) {
    for (let i = pool.length - 1; i > 0; i--) {  // trộn kiểu Fisher-Yates
      const k = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[k]] = [pool[k], pool[i]];
    }
  }
  activeQuestions = pool.slice(0, limit);        // lấy `limit` câu đầu tiên

  qIndex = 0;
  score = 0;
  quizResult.hidden = true;
  quizBody.hidden = false;
  showQuestion();
}

limitInput.addEventListener('change', startQuiz);
shuffleInput.addEventListener('change', startQuiz);

function showQuestion() {
  const item = activeQuestions[qIndex];

  quizCount.textContent = 'Câu ' + (qIndex + 1) + '/' + activeQuestions.length + ' · Đúng ' + score;
  quizBar.style.width = (qIndex / activeQuestions.length * 100) + '%';
  quizQuestion.textContent = item.q;
  quizNextBtn.hidden = true;
  quizOptions.innerHTML = '';

  item.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = 'ABCD'[i];
    const label = document.createElement('span');
    label.textContent = text;
    btn.append(letter, label);
    btn.addEventListener('click', () => chooseAnswer(i));
    quizOptions.appendChild(btn);
  });
}

function chooseAnswer(chosen) {
  const correct = activeQuestions[qIndex].answer;
  const buttons = quizOptions.querySelectorAll('.opt');

  buttons.forEach((b, i) => {
    b.disabled = true;                                  // khóa, không cho chọn lại
    if (i === correct) b.classList.add('correct');      // luôn tô xanh đáp án đúng
    else if (i === chosen) b.classList.add('wrong');    // tô đỏ nếu chọn sai
  });

  if (chosen === correct) score++;
  quizNextBtn.textContent = qIndex === activeQuestions.length - 1 ? 'Xem kết quả' : 'Câu tiếp →';
  quizNextBtn.hidden = false;
}

function showResult() {
  const total = activeQuestions.length;
  const percent = Math.round(score / total * 100);
  quizBody.hidden = true;
  quizResult.hidden = false;
  quizBar.style.width = '100%';
  quizCount.textContent = 'Hoàn thành bộ đề';
  quizScore.textContent = score + '/' + total;
  quizComment.textContent = percent >= 80 ? 'Xuất sắc! Bạn nắm bài rất chắc 🎉' : percent >= 50 ? 'Khá tốt, ôn thêm vài câu sai là ổn 👍' : 'Cần ôn lại thêm, thử làm lại nhé 💪';
}

quizNextBtn.addEventListener('click', () => {
  qIndex++;
  if (qIndex >= activeQuestions.length) showResult();
  else showQuestion();
});
document.getElementById('quizRetryBtn').addEventListener('click', startQuiz);

setSelect.addEventListener('change', () => {
  currentSet = Number(setSelect.value);
  renderSetSelect();
  startQuiz();
});

deleteSetBtn.addEventListener('click', () => {
  sets.splice(currentSet, 1);
  saveUploadedSets();
  currentSet = 0;
  renderSetSelect();
  startQuiz();
});

renderSetSelect();
startQuiz();