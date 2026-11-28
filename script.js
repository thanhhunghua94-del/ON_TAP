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
const quizPrevBtn = document.getElementById('quizPrevBtn');
const quizMap = document.getElementById('quizMap');
const quizExplain = document.getElementById('quizExplain');
const explainTitle = document.getElementById('explainTitle');
const explainText = document.getElementById('explainText');
const quizReviewBtn = document.getElementById('quizReviewBtn');
const aiExplainBtn = document.getElementById('aiExplainBtn');
const aiNote = document.getElementById('aiNote');
const aiKeyInput = document.getElementById('aiKeyInput');
const aiRemember = document.getElementById('aiRemember');
const aiStatus = document.getElementById('aiStatus');
const aiModelInput = document.getElementById('aiModelInput');
const aiClearBtn = document.getElementById('aiClearBtn');
const aiProviderSelect = document.getElementById('aiProviderSelect');
const aiTestBtn = document.getElementById('aiTestBtn');
const aiAuto = document.getElementById('aiAuto');
const quizImages = document.getElementById('quizImages');
const multiHint = document.getElementById('multiHint');
const quizConfirmBtn = document.getElementById('quizConfirmBtn');
let multiDraft = {};   // câu nhiều đáp án: các lựa chọn đang tick nhưng chưa bấm "Xác nhận" (theo số thứ tự câu)

// Bộ đề có sẵn để thử ngay
const sampleSet = {
  name: 'Mẫu: Tài chính cơ bản',
  builtin: true,
  questions: [
    { q: 'ROE được tính bằng công thức nào?', options: ['Lợi nhuận sau thuế / Vốn chủ sở hữu', 'Lợi nhuận sau thuế / Tổng tài sản', 'Doanh thu / Tổng tài sản', 'Nợ phải trả / Vốn chủ sở hữu'], answer: 0, explain: 'ROE = Lợi nhuận sau thuế / Vốn chủ sở hữu, cho biết mỗi đồng vốn của cổ đông tạo ra bao nhiêu đồng lợi nhuận. Còn Lợi nhuận sau thuế / Tổng tài sản là ROA.' },
    { q: 'Tỷ số D/E đo lường điều gì?', options: ['Khả năng sinh lời', 'Mức độ sử dụng đòn bẩy tài chính', 'Khả năng thanh toán nhanh', 'Vòng quay hàng tồn kho'], answer: 1, explain: 'D/E = Nợ phải trả / Vốn chủ sở hữu. Tỷ số càng cao thì công ty càng dùng nhiều nợ để tài trợ, tức đòn bẩy tài chính càng lớn.' },
    { q: 'P/E cao thường cho thấy điều gì?', options: ['Cổ phiếu chắc chắn bị định giá thấp', 'Công ty sắp phá sản', 'Nhà đầu tư kỳ vọng tăng trưởng cao', 'Công ty không có lợi nhuận'], answer: 2, explain: 'P/E cao thường phản ánh nhà đầu tư sẵn sàng trả giá cao vì kỳ vọng lợi nhuận tăng mạnh trong tương lai. Nó không có nghĩa chắc chắn là rẻ hay công ty gặp khó khăn.' },
    { q: 'Lãi kép khác lãi đơn ở điểm nào?', options: ['Lãi suất luôn cao hơn', 'Lãi được cộng vào vốn để sinh lãi tiếp', 'Chỉ áp dụng cho nợ', 'Chỉ tính một lần'], answer: 1, explain: 'Với lãi kép, lãi của kỳ trước được cộng vào vốn nên kỳ sau sinh lãi trên cả vốn lẫn lãi. Lãi đơn chỉ tính trên vốn gốc ban đầu.' },
    { q: 'Đa dạng hóa danh mục nhằm mục đích gì?', options: ['Tăng chắc chắn lợi nhuận', 'Tránh đóng thuế', 'Giảm chi phí giao dịch', 'Giảm rủi ro khi một tài sản giảm giá'], answer: 3, explain: 'Khi vốn được chia vào nhiều tài sản khác nhau, thua lỗ ở một tài sản có thể được bù bởi tài sản khác. Đa dạng hóa giảm rủi ro riêng lẻ nhưng không đảm bảo có lợi nhuận.' }
  ]
};

// Bộ đề người dùng tải lên được lưu trong localStorage để lần sau còn
function loadUploadedSets() {
  try { return JSON.parse(localStorage.getItem('quizSets')) || []; } catch (e) { return []; }
}
// Trả về 'ok' | 'noimg' (đã lưu nhưng bỏ ảnh vì đầy bộ nhớ) | 'fail' (không lưu được)
function saveUploadedSets() {
  const mine = sets.filter(s => !s.builtin);
  try { localStorage.setItem('quizSets', JSON.stringify(mine)); return 'ok'; } catch (e) {}
  try {   // đầy bộ nhớ trình duyệt: thử lưu lại nhưng không kèm ảnh
    const slim = mine.map((s) => Object.assign({}, s, { questions: s.questions.map((q) => { const c = Object.assign({}, q); delete c.img; return c; }) }));
    localStorage.setItem('quizSets', JSON.stringify(slim));
    return 'noimg';
  } catch (e) { return 'fail'; }
}

let sets = [sampleSet, ...loadUploadedSets()];
let currentSet = 0, qIndex = 0;
let answers = []; // đáp án người dùng đã chọn cho từng câu (undefined = chưa làm)

// ----- Đọc file: chuyển nội dung file thành mảng câu hỏi -----
function isValid(item) {
  if (!item || !item.q || !item.options || item.options.length < 2) return false;
  const n = item.options.length, a = item.answer;
  const ok = (x) => Number.isInteger(x) && x >= 0 && x < n;
  return Array.isArray(a) ? a.length > 0 && a.every(ok) : ok(a);   // answer: 1 số (1 đáp án) hoặc mảng (nhiều đáp án)
}

// Câu trả lời `a` của người học có đúng với đáp án của câu `item` không (hỗ trợ cả câu nhiều đáp án)
function isCorrect(item, a) {
  if (a === undefined || a === null) return false;
  if (Array.isArray(item.answer)) return Array.isArray(a) && a.length === item.answer.length && item.answer.every((x) => a.includes(x));
  return a === item.answer;
}

// Đáp án đúng dạng chữ, vd "B" hoặc "A, C, D"
function answerLabel(item) {
  return (Array.isArray(item.answer) ? item.answer : [item.answer]).map((i) => 'ABCD'[i]).join(', ');
}

function parseJson(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.questions;
  return list.map((item) => {
    let answer = item.answer;
    const toIndex = (x) => typeof x === 'string' ? 'ABCD'.indexOf(x.trim().toUpperCase()) : x;   // "B" -> 1
    if (Array.isArray(answer)) { answer = answer.map(toIndex); if (answer.length === 1) answer = answer[0]; }
    else if (typeof answer === 'string' && /^[A-Da-d](?:\s*[,;&]?\s*[A-Da-d])+$/.test(answer.trim())) {   // "A, C" hoặc "ACD"
      answer = answer.toUpperCase().replace(/[^A-D]/g, '').split('').map(toIndex);
    } else answer = toIndex(answer);
    return { q: String(item.q || item.question || ''), options: (item.options || []).map(String), answer: answer, explain: String(item.explain || item.explanation || '') };
  }).filter(isValid);
}

// Đổi 1 đoạn công thức LaTeX thành chữ dễ đọc, vd "\frac{a}{b} \times 2" -> "a/b × 2"
function latexToText(math) {
  const sub = '₀₁₂₃₄₅₆₇₈₉', sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const toUnicode = (digits, map) => digits.replace(/\d/g, (d) => map[Number(d)]);
  const wrap = (s) => /^[\w.,%$]+$/.test(s) ? s : '(' + s + ')';
  const symbols = { times: ' × ', cdot: ' · ', approx: ' ≈ ', Rightarrow: ' ⇒ ', Leftrightarrow: ' ⇔ ',
    leq: ' ≤ ', geq: ' ≥ ', neq: ' ≠ ', pm: ' ± ', dots: '…', ldots: '…', quad: ' ', qquad: ' ',
    left: '', right: '', Big: '', big: '', Bigg: '', bigg: '' };
  let r = math;
  for (let i = 0; i < 4; i++) {      // lặp vài lần để gỡ các lớp lồng nhau
    r = r.replace(/\\(?:text|textbf|mathbf|mathrm|mathit|operatorname)\s*\{([^{}]*)\}/g, '$1')
         .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (m, a, b) => wrap(a.trim()) + '/' + wrap(b.trim()));
  }
  r = r.replace(/\\([A-Za-z]+)/g, (m, cmd) => (cmd in symbols ? symbols[cmd] : cmd))   // \times -> ×
       .replace(/\\([%&_#{}])/g, '$1')                                                   // \% -> %
       .replace(/\\[,;! ]|\\\\/g, ' ')
       .replace(/_\{(\d+)\}|_(\d)/g, (m, a, b) => toUnicode(a || b, sub))                // D_1 -> D₁
       .replace(/_\{([^{}]*)\}/g, '_$1')
       .replace(/\^\{(\d+)\}|\^(\d)/g, (m, a, b) => toUnicode(a || b, sup))              // x^2 -> x²
       .replace(/\^\{([^{}]*)\}/g, '^($1)')
       .replace(/[{}]/g, '');
  return r.replace(/\s+/g, ' ').trim();
}

// Tìm các đoạn công thức $...$ hoặc $$...$$ trong văn bản và đổi sang chữ dễ đọc.
// Số tiền như $5,000 không bị ảnh hưởng (đoạn công thức luôn bắt đầu bằng chữ hoặc dấu \ ngay sau $).
function cleanMath(text) {
  const DOLLAR = '\u0002';
  return text
    .replace(/\\\$/g, DOLLAR)                                                  // \$ (ký hiệu đô la trong công thức) -> ký tự tạm
    .replace(/\$\$([\s\S]*?)\$\$/g, (m, math) => latexToText(math))             // $$ ... $$
    .replace(/\$([A-Za-z\\{(][^$\n]*?)\$/g, (m, math) => latexToText(math))     // $ ... $ (không lan sang dòng khác)
    .replace(new RegExp(DOLLAR, 'g'), '$');                                     // trả lại ký hiệu $
}

// Đọc chữ từ file PDF bằng thư viện pdf.js (chạy ngay trên trình duyệt, không cần API key)
async function readPdfText(file) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const content = await (await pdf.getPage(p)).getTextContent();

    // Mỗi mảnh chữ có tọa độ x, y. Ta gom các mảnh cùng độ cao thành 1 dòng rồi xếp theo x (trái -> phải),
    // vì PDF có thể lưu các ký hiệu toán (vd t = 4) ở thứ tự khác với thứ tự hiển thị.
    const items = content.items
      .filter((it) => it.str !== '')
      .map((it) => ({ s: it.str, x: it.transform[4], y: it.transform[5], w: it.width, h: it.height || 10 }));
    items.sort((a, b) => b.y - a.y || a.x - b.x);               // từ trên xuống dưới

    const rows = [];
    items.forEach((it) => {
      const row = rows[rows.length - 1];
      if (row && Math.abs(it.y - row.y) <= 0.55 * Math.max(it.h, row.h)) {   // đủ gần về chiều dọc = cùng dòng
        row.items.push(it);
        row.h = Math.max(row.h, it.h);
      } else {
        rows.push({ y: it.y, h: it.h, items: [it] });
      }
    });

    rows.forEach((row) => {
      row.items.sort((a, b) => a.x - b.x);
      let line = '', prevEnd = null;
      row.items.forEach((it) => {
        // Hai mảnh cách nhau đủ xa mà chưa có khoảng trắng thì chèn thêm 1 khoảng trắng
        if (prevEnd !== null && it.x - prevEnd > 0.2 * row.h && !line.endsWith(' ') && !it.s.startsWith(' ')) line += ' ';
        line += it.s;
        prevEnd = it.x + it.w;
      });
      text += line + '\n';
    });
    text += '\n';                                                // hết trang
  }
  return text;
}

// Đọc văn bản (từ .txt, .docx, .pdf) và TỰ LỌC ra các câu trắc nghiệm đã được định dạng sẵn.
// Hiểu các kiểu ghi đáp án: "Đáp án: B", dòng chỉ có chữ cái "B", "B (giải thích...)", "ACD" (nhiều đáp án), "D- giải thích"...
// Phần không đúng khuôn (tiêu đề, công thức tóm tắt, câu tự luận...) sẽ tự bị bỏ qua.
const LETTERS = 'ABCD';
const LETTER_LIST = '[A-D](?:\\s*(?:,|;|&|\\/|và|and)\\s*[A-D])+|[A-D]{2,4}';   // "A, C" hoặc "ACD"

// Đọc các chữ cái đáp án ở ĐẦU chuỗi s. Trả về { letters: 'ACD', len: số ký tự đã đọc } hoặc null
function readLetters(s) {
  let m = s.match(new RegExp('^(' + LETTER_LIST + ')(?![A-Za-z0-9])'));
  if (m) return { letters: m[1].replace(/[^A-D]/g, ''), len: m[0].length };
  m = s.match(/^([A-D])(?![A-Za-z0-9])/);
  return m ? { letters: m[1], len: 1 } : null;
}

// Xóa dòng "đóng dấu" của người soạn đề (không phải nội dung câu hỏi)
function stripWatermark(s) {
  return s.replace(/\(\s*soạn[^)]*\)/gi, '')
          .replace(/SOẠN ĐỘC QUYỀN BỞI(?:\s+\p{Lu}+)*/gu, '')
          .replace(/Soạn độc quyền bởi(?:\s+\p{Lu}\p{Ll}*)*/gu, '')
          .replace(/\s{2,}/g, ' ').trim();
}

const normKey = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
// Chữ mô tả (alt) của ảnh có khớp với câu hỏi này không? (dùng để biết ảnh thuộc câu nào)
function altMatches(alt, item) {
  const a = normKey(String(alt || '').normalize('NFC').replace(/^\s*hình ảnh\s*:?/i, ''));
  if (a.length < 15) return false;
  const c = normKey(item.q + item.options.map((o, i) => LETTERS[i] + o).join(''));
  const n = Math.min(a.length, c.length, 80);
  return n >= 15 && a.slice(0, n) === c.slice(0, n);
}

function parseText(text, images) {
  images = images || [];
  const questions = [];
  let qLines = [], options = [], letters = [], boldIdx = [], answer = -1, answerLetter = '';
  let lastItem = null, inExplain = false;   // câu vừa chốt xong, và đang đọc dở lời giải của nó không
  let explainParen = false, explainDepth = 0; // lời giải dạng "B ( ... )" có thể kéo dài nhiều dòng cho tới khi đóng ngoặc
  let blockExplicit = false, skipped = 0;   // blockExplicit: đang đọc 1 mục có ghi "Câu N"/"Question N"; skipped: số mục bị bỏ qua
  let curImgs = [], pendingImgs = [];       // ảnh của câu đang đọc / ảnh đứng giữa 2 câu

  const count = (s, re) => (s.match(re) || []).length;
  const opens = (s) => count(s, /[(（]/g), closes = (s) => count(s, /[)）]/g);

  // Ảnh đứng giữa 2 câu: nếu chữ mô tả khớp câu sau thì thuộc câu sau, ngược lại thuộc câu trước
  function resolvePending(item, prev) {
    pendingImgs.forEach((im) => {
      const toNext = !prev || (altMatches(im.alt, item) && !altMatches(im.alt, prev));
      const target = toNext ? item : prev;
      (target.img = target.img || []).push(im.src);
    });
    pendingImgs = [];
  }

  // Chốt câu đang đọc dở rồi chuẩn bị đọc câu mới.
  // Đáp án lấy theo thứ tự ưu tiên: dòng đáp án > đáp án duy nhất được in đậm.
  function finishQuestion() {
    if (answerLetter) {                       // đáp án ghi bằng chữ cái -> đổi sang vị trí trong danh sách
      const idxs = [];
      answerLetter.split('').forEach((ch) => {
        let k = letters.indexOf(ch);
        if (k < 0) k = LETTERS.indexOf(ch);
        if (k >= 0 && !idxs.includes(k)) idxs.push(k);
      });
      idxs.sort((a, b) => a - b);
      answer = idxs.length === 0 ? -1 : idxs.length === 1 ? idxs[0] : idxs;   // nhiều đáp án -> mảng
    }
    if (answer === -1 && boldIdx.length === 1) answer = boldIdx[0];

    let q = qLines.join(' ').trim();
    const head = /^(?:câu hỏi|câu|question)\s*\d+\s*(?:\([^)]*\))?\s*[.:)]?\s*/i;   // "Câu 1 (Chapter 1):", "Question 2"
    q = head.test(q) ? q.replace(head, '') : q.replace(/^\d+\s*(?:\([^)]*\))?\s*[.:)](?=\s|$)\s*/, '');
    q = stripWatermark(q).replace(/\s*\[VI\]/g, '\n[VI]').trim();   // phần tiếng Việt xuống dòng riêng

    const item = { q: q, options: options.map(stripWatermark), answer: answer, explain: '' };
    if (isValid(item)) {
      const prev = questions[questions.length - 1];
      if (curImgs.length) item.img = curImgs.map((im) => im.src);
      resolvePending(item, prev);
      questions.push(item);
      lastItem = item;
    } else {
      lastItem = null;
      if (options.length > 0 || blockExplicit) skipped++;
    }
    qLines = []; options = []; letters = []; boldIdx = []; answer = -1; answerLetter = ''; curImgs = [];
    blockExplicit = false; inExplain = false; explainParen = false;
  }

  // Bỏ phần đang đọc dở nếu nó không phải câu trắc nghiệm (vd câu tự luận)
  function dropBlock() {
    if (blockExplicit && qLines.length && options.length === 0) skipped++;
    qLines = []; curImgs = []; blockExplicit = false;
  }

  // Thêm 1 dòng vào lời giải của câu vừa chốt
  function addExplain(t) {
    lastItem.explain = lastItem.explain ? lastItem.explain + '\n' + t : t;
  }

  // Bắt đầu lời giải từ phần chữ đi kèm dòng đáp án, vd "( Rate of Return = ... )" hoặc "- giải thích"
  function startExplain(rest) {
    if (!lastItem || !rest) return;
    if (/^[(（]/.test(rest)) {
      const t = rest.replace(/^[(（]\s*/, '');
      explainDepth = 1 + opens(t) - closes(t);
      if (explainDepth <= 0) { addExplain(t.replace(/[)）]\s*$/, '').trim()); }
      else { addExplain(t); inExplain = true; explainParen = true; }
    } else {
      addExplain(rest);
      inExplain = true; explainParen = false;   // các dòng sau (vd "= 92,845") vẫn là lời giải, cho tới khi gặp câu mới
    }
  }

  // Đọc lần lượt từng dòng, bỏ qua dòng trống
  const lines = cleanMath(text.normalize('NFC')).replace(/\r/g, '').split('\n');

  // Lấy dòng không trống kế tiếp (dùng để đoán một dòng thuộc câu hỏi, đáp án hay lời giải)
  function nextLine(i) {
    for (let k = i + 1; k < lines.length; k++) {
      const t = lines[k].replace(/\u0001|\u0003\d+\u0003/g, '').trim();
      if (t) return t;
    }
    return '';
  }

  lines.forEach((rawLine, idx) => {
    const bold = rawLine.startsWith('\u0001');            // dòng này có in đậm không
    let line = rawLine.replace(/\u0001/g, '').replace(/\*\*/g, '').trim()
      .replace(/^(?:(?:[●•◦▪○·]|[-*–—])\s+)+/, '').trim();     // bỏ dấu đầu dòng (●, •, *, -) và ** của markdown

    // Một số file gõ chữ cái đáp án bằng chữ "giống hệt" của bảng chữ cái khác (vd chữ Β Hy Lạp thay cho B): đổi về A-D thường
    const lookalike = { 'Α': 'A', 'А': 'A', 'Ａ': 'A', 'Β': 'B', 'В': 'B', 'Ｂ': 'B', 'С': 'C', 'Ϲ': 'C', 'Ｃ': 'C', 'Ｄ': 'D' };
    if (lookalike[line[0]] && /^.(?:\s*[.):：(（-]|\s|$)/.test(line)) line = lookalike[line[0]] + line.slice(1);

    // Ảnh (đánh dấu \u0003N\u0003): gán cho câu đang đọc, hoặc để chờ xem thuộc câu nào
    line = line.replace(/\u0003(\d+)\u0003/g, (m, n) => {
      const im = images[Number(n)];
      if (im) (qLines.length || options.length ? curImgs : pendingImgs).push(im);
      return ' ';
    }).trim();
    if (!line) return;

    // Tiêu đề phần / đường kẻ ngang: kết thúc câu hiện tại và bỏ phần không phải câu hỏi
    if (/^(?:#{1,6}\s|[-_=*]{3,}$|part\s+[ivx\d]+\b|phần\s+[ivx\d]+\b|section\s+[a-z\d]+\b)/i.test(line)) {
      if (options.length > 0) finishQuestion();
      dropBlock();
      lastItem = null; inExplain = false;
      return;
    }

    // ----- Có phải dòng ĐÁP ÁN không? -----
    // Trả về { letters: 'B' | 'ACD', rest: phần chữ giải thích đi kèm } hoặc null
    function matchAnswer() {
      // "Đáp án: B", "Đáp án đúng: B", "Answer: B", "Answer / Đáp án: B", "=> Đáp án đúng: B", "Đáp án: A, C"
      const lab = line.match(/^[=>\-–—*•\s]*(?:answer|đáp án|dap an)(?:\s*\/\s*(?:answer|đáp án|dap an))?(?:\s+(?:đúng|dung))?\s*[:：-]?\s*(.*)$/i);
      if (lab) {
        const r = readLetters(lab[1]) || (/^[a-d]\b/i.test(lab[1]) ? { letters: lab[1][0].toUpperCase(), len: 1 } : null);
        if (r) return { letters: r.letters, rest: '' };
      }
      if (options.length < 2) return null;     // chưa đủ đáp án A, B thì dòng này chưa thể là đáp án
      if (/^(?:all|all of the above|all options|tất cả|cả \d+ (?:đáp án|ý))\s*\.?$/i.test(line)) return { letters: LETTERS.slice(0, options.length), rest: '' };   // "All" = chọn hết

      const r = readLetters(line);
      if (!r) return null;
      const rest = line.slice(r.len).trim();
      const fits = r.letters.split('').every((ch) => LETTERS.indexOf(ch) < options.length);   // chữ cái đáp án phải có trong danh sách lựa chọn
      const nextIsOptions = /^A\s*[.)]/i.test(nextLine(idx));     // dòng sau là "A. ..." -> dòng này là câu hỏi mới, không phải đáp án

      if (!rest) return { letters: r.letters, rest: '' };                          // "B", "ACD", "A, B"
      if (nextIsOptions || !fits) return null;
      if (/^[(（]/.test(rest)) return { letters: r.letters, rest: rest };           // "B (giải thích ...)"
      if (/^[-–—:]\s*\S/.test(rest)) return { letters: r.letters, rest: rest.replace(/^[-–—:]\s*/, '') };   // "D- giải thích"
      if (r.letters.length === 1 && options.length >= 4 && /^(?![A-Z][a-z])\S/.test(rest)) return { letters: r.letters, rest: rest };   // "D 1; NPV = ...", "B FV/(1+r)"
      return null;
    }

    // Lựa chọn: "A. text", "A) text", "A - text", "A text" (thiếu dấu chấm)
    function matchOption() {
      let opt = line.match(/^([A-D])\s*[.)]\s*(.+)$/i);                           // "A. text", "A) text", "A . text"
      const expected = LETTERS[options.length];
      if (!opt && expected && line[0] === expected) {
        if (/^[A-D]\s*[-–—]\s*\S/.test(line)) {                                    // "C- text"
          if (options.length > 0 || /^B\s*[.)\-–—]\s*\S|^B\s+\S/.test(nextLine(idx))) opt = [line, expected, line.replace(/^[A-D]\s*[-–—]\s*/, '')];
        } else if (/^[A-D]\s+\S/.test(line)) {
          // Viết thiếu dấu chấm, vd "D 68.2% and 6.6%": chỉ nhận khi đúng thứ tự A, B, C, D.
          // Riêng "A ..." phải có dòng "B ..." ngay sau, để không nhầm với câu hỏi bắt đầu bằng "A company..."
          const startsList = options.length === 0 && /^B\s*[.)]?\s+\S/.test(nextLine(idx));
          if (options.length > 0 || startsList) opt = [line, expected, line.slice(1).trim()];
        }
      }
      return opt;
    }

    const ans = matchAnswer();
    const opt = ans ? null : matchOption();
    const label = '(?:step-by-step solution|answer guidelines|explanation|solution|lời giải(?: chi tiết)?|giải thích|hướng dẫn trả lời)';
    const explainLabel = new RegExp('^[(（]?\\s*' + label + '(?:\\s*\\/\\s*' + label + ')?\\s*[:：-]\\s*', 'i');
    const explicitQ = /^(?:câu hỏi|câu|question)\s*\d+/i.test(line);             // "Câu 3", "Question 3"
    const bareQ = /^\d+\s*(?:\([^)]*\))?\s*[.:)](?=\s|$)/.test(line);                    // "3." hoặc "3)"
    // Dòng "1. ..." nằm trong lời giải là bước giải, không phải câu hỏi mới (trừ khi ngay sau là đáp án A)
    const isNewQuestion = explicitQ || (bareQ && !(lastItem && inExplain && !/^[A-D]\s*[.)]/.test(nextLine(idx))));

    if (ans) {
      answerLetter = ans.letters;
      finishQuestion();
      startExplain(ans.rest);                                 // "B (giải thích)": phần trong ngoặc chính là lời giải
    } else if (lastItem && inExplain && explainParen && !explicitQ && !/^A\s*[.)]/i.test(nextLine(idx))) {
      // Lời giải dạng "( ... )" kéo dài nhiều dòng: đọc tới khi đóng ngoặc
      explainDepth += opens(line) - closes(line);
      if (explainDepth <= 0) { addExplain(line.replace(/[)）]\s*$/, '').trim()); inExplain = false; explainParen = false; }
      else addExplain(line);
    } else if (lastItem && explainLabel.test(line)) {
      let t = line.replace(explainLabel, '');                 // "Lời giải chi tiết: ..." / "Explanation / Giải thích: ..." / "(Giải thích: ..."
      inExplain = true; explainParen = /^[(（]/.test(line);
      if (explainParen) {                                     // lời giải nằm trong ngoặc: đọc tới khi đóng ngoặc
        explainDepth = 1 + opens(t) - closes(t);
        if (explainDepth <= 0) { t = t.replace(/[)）]\s*$/, '').trim(); inExplain = false; explainParen = false; }
      }
      if (t) addExplain(t);
    } else if (lastItem && !inExplain && /^[=＝]/.test(line) && !isNewQuestion) {
      addExplain(line);                                       // dòng bắt đầu bằng "=" ngay sau câu: là phần tính toán của lời giải
    } else if (lastItem && inExplain && !explainParen && !isNewQuestion && (opt || !/^[A-D]\s*[.)]/.test(nextLine(idx)))) {
      addExplain(line);                                       // các dòng tiếp theo của lời giải
    } else if (opt) {
      lastItem = null; inExplain = false; explainParen = false;
      options.push(opt[2]);
      letters.push(opt[1].toUpperCase());
      if (bold) boldIdx.push(options.length - 1);             // nhớ lại đáp án nào đang in đậm
    } else if (isNewQuestion) {
      if (options.length > 0) finishQuestion(); else dropBlock();   // câu cũ không có dòng Đáp án -> chốt luôn
      lastItem = null; inExplain = false; explainParen = false;
      qLines = [line];                                        // bắt đầu câu mới
      blockExplicit = explicitQ;
    } else if (options.length > 0) {
      if (/^A\s*[.)]/i.test(nextLine(idx))) {                 // câu hỏi mới không đánh số, đáp án A xuất hiện ngay sau
        finishQuestion();
        lastItem = null;
        qLines = [line];
      } else {
        options[options.length - 1] += ' ' + line;           // dòng bị ngắt giữa chừng (hay gặp ở PDF): ghép vào đáp án trước
      }
    } else {
      lastItem = null; inExplain = false; explainParen = false;
      qLines.push(line);                                      // câu hỏi viết nhiều dòng
    }
  });

  if (options.length > 0) finishQuestion(); else dropBlock();   // câu cuối cùng
  if (pendingImgs.length && questions.length) resolvePending(questions[questions.length - 1], null);
  questions.skipped = skipped;                                  // số mục bị tự động bỏ qua
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
// - Ảnh: được cất vào mảng `images`, và thay bằng dấu \u0003N\u0003 trên 1 dòng riêng.
//   (Phải xử lý riêng vì chữ mô tả ảnh (alt) có thể chứa xuống dòng, làm hỏng việc tách dòng.)
function htmlToText(html, images) {
  images = images || [];
  const countChars = (s) => s.replace(/\s/g, '').length;
  const decode = (s) => new DOMParser().parseFromString(s, 'text/html').body.textContent;
  return html
    .replace(/<img\b(?:"[^"]*"|'[^']*'|[^>"'])*>/gi, (tag) => {
      const src = (tag.match(/\ssrc="([^"]*)"/i) || [])[1];
      if (!src) return '';
      const alt = decode((tag.match(/\salt="([^"]*)"/i) || [, ''])[1]).slice(0, 400);
      images.push({ src: src, alt: alt });
      return '<br />\u0003' + (images.length - 1) + '\u0003<br />';
    })
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
  const name = file.name.replace(/\.\w+$/, '');
  const newSet = { name: name, questions: questions, v: 3 };   // v: 3 = bộ đề đã lưu kèm lời giải, nhiều đáp án, ảnh
  const old = sets.findIndex((s) => !s.builtin && s.name === name);
  if (old >= 0) sets[old] = newSet;                            // trùng tên: cập nhật bản cũ
  else sets.push(newSet);
  const saved = saveUploadedSets();
  currentSet = old >= 0 ? old : sets.length - 1;
  delete progressStore[name];                                  // bộ đề mới: xóa tiến độ cũ cùng tên
  renderSetSelect();
  startQuiz();
  const withExplain = questions.filter((q) => q.explain).length;
  const multi = questions.filter((q) => Array.isArray(q.answer)).length;
  const withImg = questions.filter((q) => q.img && q.img.length).length;
  showMessage((old >= 0 ? 'Đã cập nhật ' : 'Đã thêm ') + questions.length + ' câu hỏi từ "' + file.name + '". ' +
    'Cả ' + questions.length + ' câu đều xác định được đáp án đúng; ' + withExplain + ' câu có lời giải chi tiết' +
    (multi ? '; ' + multi + ' câu có nhiều đáp án đúng' : '') + (withImg ? '; ' + withImg + ' câu có ảnh' : '') + '.' +
    (questions.skipped ? ' Đã bỏ qua ' + questions.skipped + ' mục (không đủ đáp án A-D hoặc không xác định được đáp án đúng).' : '') +
    (saved === 'noimg' ? ' ⚠ Bộ nhớ trình duyệt đầy nên ảnh chỉ giữ tới khi tải lại trang.' : '') +
    (saved === 'fail' ? ' ⚠ Không lưu được bộ đề vào trình duyệt (đầy bộ nhớ): bộ này sẽ mất khi tải lại trang.' : ''), saved === 'fail');
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    // File PDF: dùng thư viện pdf.js lấy chữ ra (chỉ đọc được PDF có chữ, PDF scan thành ảnh thì chưa đọc được)
    if (typeof pdfjsLib === 'undefined') {
      showMessage('Chưa tải được thư viện đọc PDF. Kiểm tra mạng rồi thử lại.', true);
    } else {
      readPdfText(file)
        .then((text) => {
          if (text.replace(/\s/g, '').length < 20) showMessage('PDF này không có chữ (có thể là file scan thành ảnh).', true);
          else addSet(file, parseText(text));
        })
        .catch((e) => { console.error(e); showMessage('Không đọc được file PDF này: ' + ((e && e.message) || e), true); });
    }
    fileInput.value = '';
    return;
  }

  if (name.endsWith('.doc')) {
    showMessage('File .doc (Word cũ) chưa đọc được. Hãy mở bằng Word, chọn Lưu dưới dạng → .docx rồi tải lại.', true);
    fileInput.value = '';
    return;
  }

  showMessage('Đang đọc file...', false);

  if (name.endsWith('.docx')) {
    // File Word: dùng thư viện mammoth lấy phần chữ ra, rồi đọc như file .txt
    if (typeof mammoth === 'undefined') {
      showMessage('Chưa tải được thư viện đọc Word. Kiểm tra mạng rồi thử lại.', true);
    } else {
      file.arrayBuffer()
        .then((buffer) => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then((result) => {
          const images = [];
          addSet(file, parseText(htmlToText(result.value, images), images));
        })
        .catch((e) => { console.error(e); showMessage('Không đọc được file Word này: ' + ((e && e.message) || e), true); });
    }
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      addSet(file, name.endsWith('.json') ? parseJson(reader.result) : parseText(reader.result));
    } catch (e) {
      console.error(e);
      showMessage('File bị lỗi định dạng, không đọc được: ' + ((e && e.message) || e), true);
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
    const outdated = !s.builtin && !s.v;                      // bộ đề cũ, lưu trước khi có lời giải
    option.textContent = s.name + ' (' + s.questions.length + ' câu)' + (outdated ? ' ⚠ bản cũ, chưa có lời giải' : '');
    setSelect.appendChild(option);
  });
  setSelect.value = currentSet;
  limitInput.value = '';                                       // trống = làm tất cả
  limitInput.placeholder = 'Tất cả ' + sets[currentSet].questions.length;
  deleteSetBtn.hidden = !!sets[currentSet].builtin; // không cho xóa bộ đề mẫu
  renderNotes();                                    // sổ câu sai của bộ đề đang chọn
}

let activeQuestions = []; // các câu sẽ làm trong lần này (đã giới hạn số câu / trộn)
let activeOrder = [];     // vị trí của các câu đó trong bộ đề gốc (để lưu và khôi phục tiến độ)

// ----- Lưu tiến độ riêng cho từng bộ đề (kể cả khi chuyển bộ đề khác hoặc tải lại trang) -----
function loadProgress() {
  try { return JSON.parse(localStorage.getItem('quizProgress')) || {}; } catch (e) { return {}; }
}
const progressStore = loadProgress();   // dạng { "tên bộ đề": {tiến độ}, ... }

// Chụp lại trạng thái làm bài hiện tại (để lưu, hoặc để cất đi khi chuyển sang luyện câu sai)
function snapshotProgress() {
  const set = sets[currentSet];
  return {
    total: set.questions.length,                                           // để biết bộ đề có bị thay đổi không
    order: activeOrder,
    answers: Array.from({ length: activeOrder.length }, (_, k) => answers[k] === undefined ? null : answers[k]),
    qIndex: qIndex,
    limit: limitInput.value,
    shuffle: shuffleInput.checked,
    done: !quizResult.hidden,                                              // đang ở màn hình kết quả không
    mode: practiceMode                                                     // đang luyện câu sai? ('' = làm bình thường)
  };
}

function saveProgress() {
  const set = sets[currentSet];
  const snap = snapshotProgress();
  if (practiceMode && parentProgress) snap.parent = parentProgress;        // bài chính đang làm dở, cất lại để quay về sau
  progressStore[set.name] = snap;
  progressStore._last = set.name;                                          // nhớ bộ đề đang làm dở
  try { localStorage.setItem('quizProgress', JSON.stringify(progressStore)); } catch (e) {}
}

// Tiến độ đã lưu có còn khớp với bộ đề hiện tại không
function isValidProgress(set, saved) {
  return !!saved && saved.total === set.questions.length && Array.isArray(saved.order) &&
    saved.order.length > 0 && saved.order.every((i) => i < set.questions.length) && Array.isArray(saved.answers);
}

// Đưa tiến độ đã lưu trở lại màn hình
function applyProgress(set, saved) {
  multiDraft = {};
  practiceMode = saved.mode || '';
  parentProgress = practiceMode && isValidProgress(set, saved.parent) ? saved.parent : null;
  limitInput.value = saved.limit;
  shuffleInput.checked = !!saved.shuffle;
  activeOrder = saved.order;
  activeQuestions = activeOrder.map((i) => set.questions[i]);
  answers = saved.answers.map((a) => a === null ? undefined : a);
  qIndex = Math.min(saved.qIndex || 0, activeQuestions.length - 1);
  if (saved.done) showResult(); else showQuestion();
}

// Mở 1 bộ đề: nếu từng làm dở thì khôi phục đúng chỗ đó, chưa làm thì bắt đầu mới
function openSet() {
  const set = sets[currentSet];
  const saved = progressStore[set.name];
  if (!isValidProgress(set, saved)) { startQuiz(); return; }
  applyProgress(set, saved);
}

// Quay về bài chính đang làm dở trước khi chuyển sang luyện câu sai
function resumeMain() {
  if (parentProgress) applyProgress(sets[currentSet], parentProgress);
  else { limitInput.value = ''; startQuiz(); }
}

// Bắt đầu làm MỚI (xóa tiến độ cũ của bộ đề này).
// Nếu truyền vào customOrder (mảng vị trí câu) thì chỉ làm đúng các câu đó (chế độ luyện câu sai).
function startQuiz(customOrder, modeLabel) {
  const all = sets[currentSet].questions;
  const custom = Array.isArray(customOrder) && customOrder.length > 0;
  if (custom && !practiceMode && activeQuestions.length) parentProgress = snapshotProgress();   // cất bài chính đang làm dở, không để mất
  if (!custom) parentProgress = null;                                                           // bắt đầu bài mới bình thường
  practiceMode = custom ? (modeLabel || 'Luyện tập') : '';

  // Số câu muốn làm: để trống = tất cả, và không vượt quá số câu có trong bộ đề
  let limit = custom ? customOrder.length : (parseInt(limitInput.value) || all.length);
  limit = Math.max(1, Math.min(limit, all.length));
  if (custom) limitInput.value = '';
  else if (limitInput.value !== '') limitInput.value = limit;

  const pool = custom ? customOrder.slice() : all.map((q, i) => i);   // danh sách vị trí các câu sẽ làm
  if (shuffleInput.checked) {
    for (let i = pool.length - 1; i > 0; i--) {  // trộn kiểu Fisher-Yates
      const k = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[k]] = [pool[k], pool[i]];
    }
  }
  activeOrder = pool.slice(0, limit);            // lấy `limit` câu đầu tiên
  activeQuestions = activeOrder.map((i) => all[i]);

  qIndex = 0;
  answers = [];
  multiDraft = {};
  quizResult.hidden = true;
  quizBody.hidden = false;
  showQuestion();
}

limitInput.addEventListener('change', startQuiz);
shuffleInput.addEventListener('change', startQuiz);

function showQuestion() {
  const item = activeQuestions[qIndex];
  const chosen = answers[qIndex];                       // undefined = chưa trả lời câu này
  const total = activeQuestions.length;
  const answered = answers.filter((a) => a !== undefined).length;
  const right = answers.filter((a, i) => isCorrect(activeQuestions[i], a)).length;
  const multi = Array.isArray(item.answer);                // câu có nhiều đáp án đúng
  const draft = multiDraft[qIndex] || [];

  quizBody.hidden = false;
  quizResult.hidden = true;
  quizCount.textContent = 'Câu ' + (qIndex + 1) + '/' + total + ' · Đã làm ' + answered + ' · Đúng ' + right;
  quizBar.style.width = (answered / total * 100) + '%';
  quizQuestion.textContent = item.q;
  quizImages.innerHTML = '';                            // ảnh đi kèm câu hỏi (nếu có)
  (item.img || []).forEach((src) => {
    const im = document.createElement('img');
    im.src = src;
    im.alt = 'Hình minh họa cho câu hỏi';
    quizImages.appendChild(im);
  });
  quizImages.hidden = !(item.img && item.img.length);
  multiHint.hidden = !multi;
  multiHint.textContent = 'Câu này có ' + (multi ? item.answer.length : '') + ' đáp án đúng. Hãy tick tất cả rồi bấm "Xác nhận".';
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
    if (multi && chosen === undefined && draft.includes(i)) btn.classList.add('picked');
    btn.addEventListener('click', () => chooseAnswer(i));
    quizOptions.appendChild(btn);
  });

  quizPrevBtn.disabled = qIndex === 0;
  quizNextBtn.textContent = qIndex === total - 1 ? 'Xem kết quả' : 'Câu tiếp →';

  quizConfirmBtn.hidden = true;
  noteOpen = false;
  updateModeNote();
  if (chosen === undefined) {          // chưa làm: ẩn lời giải và nút "Câu tiếp"
    quizExplain.hidden = true;
    markBar.hidden = true;
    quizNextBtn.hidden = true;
    if (multi) { quizConfirmBtn.hidden = false; quizConfirmBtn.disabled = draft.length === 0; }
  } else {                             // đã làm (kể cả khi quay lại xem): hiện đáp án và lời giải
    revealAnswer(chosen);
  }
  renderMap(true);
  saveProgress();
}

// Hiện đáp án đúng/sai và lời giải cho câu hiện tại
function revealAnswer(chosen) {
  const item = activeQuestions[qIndex];
  const correctList = Array.isArray(item.answer) ? item.answer : [item.answer];   // danh sách đáp án đúng
  const chosenList = Array.isArray(chosen) ? chosen : [chosen];                  // danh sách đã chọn
  const correct = correctList[0];

  quizOptions.querySelectorAll('.opt').forEach((b, i) => {
    b.disabled = true;                                  // khóa, không cho chọn lại
    b.classList.remove('picked');
    if (correctList.includes(i)) b.classList.add('correct');       // luôn tô xanh đáp án đúng
    else if (chosenList.includes(i)) b.classList.add('wrong');     // tô đỏ nếu chọn sai
    if (chosenList.includes(i)) {                                 // ghi chú "Bạn chọn" để xem lại cho rõ
      const tag = document.createElement('span');
      tag.className = 'you';
      tag.textContent = 'Bạn chọn';
      b.appendChild(tag);
    }
  });

  const isRight = isCorrect(item, chosen);
  quizExplain.hidden = false;
  quizExplain.className = 'explain ' + (isRight ? 'good' : 'bad');
  explainTitle.textContent = isRight ? '✓ Chính xác!' : '✗ Chưa đúng. Đáp án đúng là ' + answerLabel(item);
  // Dùng lời giải trong file; nếu file không có thì chỉ nêu đáp án đúng
  const cur = sets[currentSet];
  const outdated = !cur.builtin && !cur.v;
  explainText.textContent = item.explain ||
    ('Đáp án đúng: ' + correctList.map((i) => 'ABCD'[i] + '. ' + item.options[i]).join('; ') + '\n' +
     (outdated ? '(Bộ đề này được lưu từ trước khi có lời giải. Hãy bấm "Xóa bộ đề" rồi tải lại file, hoặc tải lại đúng tên file để cập nhật.)'
               : '(Đáp án này lấy từ chữ in đậm/đỏ hoặc dòng đáp án trong file. File không có lời giải chi tiết cho câu này.)'));

  // Nút AI chỉ hiện ở câu chưa có lời giải; câu có lời giải do AI viết thì hiện ghi chú
  const waiting = aiPending.has(item);
  aiExplainBtn.hidden = !!item.explain;
  aiExplainBtn.disabled = waiting;
  aiExplainBtn.textContent = waiting ? 'Đang tạo lời giải...' : '🤖 Tạo lời giải bằng AI';
  aiNote.hidden = !(item.ai || waiting);
  aiNote.textContent = waiting ? '🤖 Đang nhờ AI viết lời giải...' : (item.ai ? '🤖 Lời giải do AI tạo, có thể chưa chính xác. Hãy đối chiếu giáo trình.' : '');
  quizNextBtn.hidden = false;
  renderMarkBar();                          // nút đánh dấu + ghi chú cho câu này
  maybeAutoExplain();                       // có key + bật tự động -> tự nhờ AI viết lời giải cho câu này
}

// Bản đồ câu hỏi: mỗi câu là 1 ô vuông, xanh = đúng, đỏ = sai, bấm vào để xem lại
function renderMap(markCurrent) {
  quizMap.innerHTML = '';
  const firstOpen = activeQuestions.findIndex((q, k) => answers[k] === undefined); // câu đầu tiên chưa làm
  activeQuestions.forEach((q, i) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = i + 1;
    if (answers[i] !== undefined) chip.classList.add(isCorrect(q, answers[i]) ? 'right' : 'wrong');
    if (markCurrent && i === qIndex) chip.classList.add('current');
    chip.disabled = firstOpen !== -1 && i > firstOpen;  // chưa làm tới thì chưa vào được
    chip.addEventListener('click', () => { qIndex = i; showQuestion(); });
    quizMap.appendChild(chip);
  });
}

function chooseAnswer(chosen) {
  if (answers[qIndex] !== undefined) return;            // đã trả lời rồi thì không đổi được
  if (Array.isArray(activeQuestions[qIndex].answer)) {  // câu nhiều đáp án: bấm để tick/bỏ tick, chờ bấm "Xác nhận"
    const draft = multiDraft[qIndex] || [];
    multiDraft[qIndex] = draft.includes(chosen) ? draft.filter((x) => x !== chosen) : draft.concat(chosen).sort((a, b) => a - b);
    quizOptions.querySelectorAll('.opt').forEach((b, i) => b.classList.toggle('picked', multiDraft[qIndex].includes(i)));
    quizConfirmBtn.disabled = multiDraft[qIndex].length === 0;
    return;
  }
  answers[qIndex] = chosen;
  recordResult(activeQuestions[qIndex], chosen);        // câu sai tự vào Sổ câu sai
  showQuestion();                                       // vẽ lại ở trạng thái "đã trả lời"
}

quizConfirmBtn.addEventListener('click', () => {
  const draft = multiDraft[qIndex] || [];
  if (answers[qIndex] !== undefined || draft.length === 0) return;
  answers[qIndex] = draft.slice();
  recordResult(activeQuestions[qIndex], answers[qIndex]);
  showQuestion();
});

function showResult() {
  const total = activeQuestions.length;
  const score = answers.filter((a, i) => isCorrect(activeQuestions[i], a)).length;
  const percent = Math.round(score / total * 100);
  quizBody.hidden = true;
  quizResult.hidden = false;
  quizBar.style.width = '100%';
  quizCount.textContent = 'Hoàn thành bộ đề';
  quizScore.textContent = score + '/' + total;
  quizComment.textContent = percent >= 80 ? 'Xuất sắc! Bạn nắm bài rất chắc 🎉' : percent >= 50 ? 'Khá tốt, ôn thêm vài câu sai là ổn 👍' : 'Cần ôn lại thêm, thử làm lại nhé 💪';
  const wrongCount = answers.filter((a, i) => !isCorrect(activeQuestions[i], a)).length;
  quizRetryWrongBtn.hidden = wrongCount === 0;
  quizRetryWrongBtn.textContent = '🔁 Làm lại ' + wrongCount + ' câu sai';
  quizFullBtn.hidden = !practiceMode;
  quizFullBtn.textContent = parentProgress ? '↩ Về bài đang làm' : 'Làm cả bộ đề';
  updateModeNote();
  renderMap(false);
  saveProgress();
}

quizNextBtn.addEventListener('click', () => {
  if (qIndex >= activeQuestions.length - 1) showResult();
  else { qIndex++; showQuestion(); }
});
quizPrevBtn.addEventListener('click', () => {
  if (qIndex > 0) { qIndex--; showQuestion(); }
});
quizReviewBtn.addEventListener('click', () => { qIndex = 0; showQuestion(); });
// "Làm lại": đang luyện câu sai thì luyện lại đúng các câu đó, còn không thì làm lại cả bộ
document.getElementById('quizRetryBtn').addEventListener('click', () => {
  if (practiceMode) startQuiz(activeOrder.slice(), practiceMode); else startQuiz();
});

setSelect.addEventListener('change', () => {
  currentSet = Number(setSelect.value);
  renderSetSelect();
  openSet();                 // làm dở bộ nào thì quay lại đúng chỗ đó
});

deleteSetBtn.addEventListener('click', () => {
  delete progressStore[sets[currentSet].name];   // xóa luôn tiến độ của bộ đề này
  sets.splice(currentSet, 1);
  saveUploadedSets();
  currentSet = 0;
  renderSetSelect();
  openSet();
});


// =====================================================
// 6b. LUYỆN CÂU SAI + SỔ CÂU SAI (đánh dấu, ghi chú)
// =====================================================
const quizModeNote = document.getElementById('quizModeNote');
const quizModeNoteText = document.getElementById('quizModeNoteText');
const quizRetryWrongBtn = document.getElementById('quizRetryWrongBtn');
const quizFullBtn = document.getElementById('quizFullBtn');
const backToMainBtn = document.getElementById('backToMainBtn');
const quizOpenNotesBtn = document.getElementById('quizOpenNotesBtn');
const practiceNotesBtn = document.getElementById('practiceNotesBtn');
const markBar = document.getElementById('markBar');
const starBtn = document.getElementById('starBtn');
const noteBtn = document.getElementById('noteBtn');
const noteInput = document.getElementById('noteInput');
const notesTabBtn = document.querySelector('.tab[data-tab="notes"]');
const notesSummary = document.getElementById('notesSummary');
const notesFilter = document.getElementById('notesFilter');
const notesList = document.getElementById('notesList');
const notesPracticeBtn = document.getElementById('notesPracticeBtn');
const notesClearDoneBtn = document.getElementById('notesClearDoneBtn');
const notesExportBtn = document.getElementById('notesExportBtn');

let parentProgress = null;   // bài chính đang làm dở (được cất lại khi chuyển sang luyện câu sai)
let practiceMode = '';   // '' = làm bình thường; chữ = đang luyện (vd "Luyện câu sai")
let noteOpen = false;    // ô ghi chú đang mở ở câu hiện tại không

// Sổ câu sai lưu theo tên bộ đề: { "tên bộ đề": { "mã câu": {câu hỏi, số lần sai, ⭐, ghi chú...} } }
function loadNotes() {
  try { return JSON.parse(localStorage.getItem('quizNotes')) || {}; } catch (e) { return {}; }
}
const notesStore = loadNotes();
function saveNotes() {
  try { localStorage.setItem('quizNotes', JSON.stringify(notesStore)); } catch (e) {}
}

// Mã nhận diện 1 câu (dựa vào nội dung, nên trộn câu hay đổi thứ tự vẫn nhận ra đúng câu)
function qKey(item) {
  const str = item.q + '|' + item.options.join('|');
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + '-' + str.length.toString(36);
}
const getBook = () => notesStore[sets[currentSet].name] || {};

function ensureEntry(item) {
  const name = sets[currentSet].name;
  const book = notesStore[name] = notesStore[name] || {};
  const key = qKey(item);
  if (!book[key]) {
    // Chỉ chép chữ (không chép ảnh) để tiết kiệm bộ nhớ; khi xem sẽ lấy bản đầy đủ từ bộ đề
    book[key] = { q: item.q, options: item.options.slice(), answer: item.answer, explain: item.explain || '',
                  wrong: 0, right: 0, lastRight: undefined, chosen: null, star: false, note: '', ts: Date.now() };
  }
  return book[key];
}

// Dọn mục trống (không sai, không đánh dấu, không ghi chú)
function pruneEntry(item) {
  const book = getBook(), key = qKey(item), e = book[key];
  if (e && !e.wrong && !e.star && !e.note) delete book[key];
}

// Gọi mỗi khi người học chốt đáp án 1 câu
function recordResult(item, chosen) {
  const book = getBook(), key = qKey(item);
  if (isCorrect(item, chosen)) {
    if (book[key]) { book[key].right = (book[key].right || 0) + 1; book[key].lastRight = true; }   // câu từng sai nay đã làm đúng
  } else {
    const e = ensureEntry(item);
    e.wrong++; e.lastRight = false; e.chosen = chosen; e.ts = Date.now();
    e.explain = item.explain || e.explain;
  }
  saveNotes();
  updateNotesBadge();
}

function toggleStar(item) {
  const e = ensureEntry(item);
  e.star = !e.star;
  e.ts = Date.now();
  pruneEntry(item); saveNotes(); updateNotesBadge();
}

function setNote(item, text) {
  const e = ensureEntry(item);
  e.note = text;
  pruneEntry(item); saveNotes(); updateNotesBadge();
}

// Các câu cần luyện lại: có đánh dấu ⭐, hoặc đã sai và chưa làm đúng lại
const needsPractice = (e) => e.star || (e.wrong > 0 && !e.lastRight);

function updateNotesBadge() {
  const entries = Object.values(getBook());
  notesTabBtn.textContent = '📒 Sổ câu sai' + (entries.length ? ' (' + entries.length + ')' : '');
  const n = entries.filter(needsPractice).length;
  practiceNotesBtn.textContent = '🔁 Luyện câu trong sổ (' + n + ')';
  practiceNotesBtn.disabled = n === 0;
}

function updateModeNote() {
  quizModeNote.hidden = !practiceMode;
  quizModeNoteText.textContent = '🎯 Đang luyện: ' + practiceMode + ' · ' + activeQuestions.length + ' câu';
  backToMainBtn.hidden = !parentProgress;                       // có bài chính đang làm dở thì cho quay về
  if (parentProgress) {
    const done = parentProgress.answers.filter((a) => a !== null).length;
    backToMainBtn.textContent = '↩ Về bài đang làm (' + done + '/' + parentProgress.order.length + ')';
  }
}

// Thanh "Đánh dấu / Ghi chú" dưới lời giải (hiện sau khi đã trả lời)
function renderMarkBar() {
  const item = activeQuestions[qIndex];
  const e = getBook()[qKey(item)];
  markBar.hidden = false;
  starBtn.textContent = e && e.star ? '⭐ Đã đánh dấu cần nhớ' : '☆ Đánh dấu cần nhớ';
  starBtn.classList.toggle('on', !!(e && e.star));
  const showNote = noteOpen || !!(e && e.note);
  noteInput.hidden = !showNote;
  noteInput.value = e ? e.note : '';
  noteBtn.textContent = showNote ? '📝 Ghi chú' : '📝 Thêm ghi chú';
  document.getElementById('markInfo').textContent = isCorrect(item, answers[qIndex])
    ? '' : 'Câu sai đã được lưu vào "Sổ câu sai".';
}

starBtn.addEventListener('click', () => { toggleStar(activeQuestions[qIndex]); renderMarkBar(); });
noteBtn.addEventListener('click', () => { noteOpen = true; renderMarkBar(); noteInput.focus(); });
noteInput.addEventListener('input', () => setNote(activeQuestions[qIndex], noteInput.value));

// Bắt đầu làm lại các câu (danh sách entries) trong bộ đề hiện tại
function practiceEntries(entries, label) {
  const questions = sets[currentSet].questions;
  const pos = new Map(questions.map((q, i) => [qKey(q), i]));
  const order = entries.map((e) => pos.get(qKey(e))).filter((i) => i !== undefined);
  if (order.length === 0) { showMessage('Không có câu nào để luyện (bộ đề có thể đã được thay đổi).', true); return; }
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === 'quiz'));
  panels.forEach((p) => p.classList.toggle('active', p.id === 'quiz'));
  startQuiz(order, label);
}

quizRetryWrongBtn.addEventListener('click', () => {
  const order = activeOrder.filter((_, k) => !isCorrect(activeQuestions[k], answers[k]));
  if (order.length) startQuiz(order, 'Làm lại các câu sai');
});
quizFullBtn.addEventListener('click', resumeMain);
backToMainBtn.addEventListener('click', resumeMain);
quizOpenNotesBtn.addEventListener('click', () => notesTabBtn.click());
practiceNotesBtn.addEventListener('click', () => practiceEntries(Object.values(getBook()).filter(needsPractice), 'Sổ câu sai'));

// ----- Tab "Sổ câu sai" -----
function visibleEntries() {
  const f = notesFilter.value;
  return Object.entries(getBook())
    .filter(([k, e]) => f === 'star' ? e.star : f === 'todo' ? (e.wrong > 0 && !e.lastRight) : f === 'done' ? (e.wrong > 0 && e.lastRight) : f === 'note' ? !!e.note : true)
    .sort((a, b) => b[1].ts - a[1].ts);
}

function renderNotes() {
  updateNotesBadge();
  const book = getBook();
  const all = Object.values(book);
  const set = sets[currentSet];
  const byKey = new Map(set.questions.map((q) => [qKey(q), q]));      // bản đầy đủ (có ảnh, lời giải mới nhất)
  const list = visibleEntries();

  notesSummary.textContent = 'Bộ đề "' + set.name + '": ' + all.length + ' câu trong sổ · ' +
    all.filter((e) => e.wrong > 0 && !e.lastRight).length + ' câu chưa làm đúng lại · ' +
    all.filter((e) => e.star).length + ' câu đã đánh dấu ⭐';
  notesPracticeBtn.disabled = list.length === 0;
  notesClearDoneBtn.disabled = !all.some((e) => e.wrong > 0 && e.lastRight && !e.star && !e.note);
  notesExportBtn.disabled = list.length === 0;

  notesList.innerHTML = '';
  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'notes-empty';
    empty.textContent = all.length === 0
      ? 'Chưa có câu nào. Câu làm sai sẽ tự động vào đây. Bạn cũng có thể bấm "☆ Đánh dấu cần nhớ" ở bất kỳ câu nào sau khi trả lời.'
      : 'Không có câu nào khớp bộ lọc này.';
    notesList.appendChild(empty);
    return;
  }

  list.forEach(([key, e]) => {
    const src = byKey.get(key) || e;                                    // nếu bộ đề đã đổi, dùng bản đã chép trong sổ
    const correctList = Array.isArray(e.answer) ? e.answer : [e.answer];
    const wrongList = e.chosen === null || e.chosen === undefined ? [] : (Array.isArray(e.chosen) ? e.chosen : [e.chosen]);
    const card = document.createElement('article');
    card.className = 'note-card' + (e.star ? ' starred' : '');

    const head = document.createElement('div');
    head.className = 'note-head';
    const badges = document.createElement('div');
    badges.className = 'note-badges';
    const addBadge = (text, cls) => { const b = document.createElement('span'); b.className = 'badge ' + cls; b.textContent = text; badges.appendChild(b); };
    if (e.wrong > 0) addBadge('Sai ' + e.wrong + ' lần', 'bad');
    if (e.wrong > 0) addBadge(e.lastRight ? '✓ Lần gần nhất đúng' : 'Chưa làm đúng lại', e.lastRight ? 'good' : 'warn');
    if (!e.wrong) addBadge('Tự đánh dấu', 'info');
    const tools = document.createElement('div');
    tools.className = 'note-tools';
    const star = document.createElement('button');
    star.className = 'ghost small'; star.type = 'button';
    star.textContent = e.star ? '⭐ Bỏ đánh dấu' : '☆ Đánh dấu';
    star.addEventListener('click', () => { e.star = !e.star; e.ts = Date.now(); saveNotes(); renderNotes(); });
    const del = document.createElement('button');
    del.className = 'ghost small'; del.type = 'button'; del.textContent = '🗑 Xóa';
    del.addEventListener('click', () => { delete getBook()[key]; saveNotes(); renderNotes(); });
    tools.append(star, del);
    head.append(badges, tools);

    const q = document.createElement('div');
    q.className = 'note-q';
    q.textContent = src.q;
    card.append(head, q);

    if (src.img && src.img.length) {
      const imgs = document.createElement('div');
      imgs.className = 'qimgs';
      src.img.forEach((u) => { const im = document.createElement('img'); im.src = u; im.alt = 'Hình minh họa'; imgs.appendChild(im); });
      card.appendChild(imgs);
    }

    const ul = document.createElement('ul');
    ul.className = 'note-opts';
    src.options.forEach((text, i) => {
      const li = document.createElement('li');
      const right = correctList.includes(i), wrong = wrongList.includes(i) && !right;
      li.className = right ? 'correct' : wrong ? 'wrong' : '';
      li.textContent = 'ABCD'[i] + '. ' + text + (right ? '  ✓ đúng' : wrong ? '  ✗ bạn đã chọn' : '');
      ul.appendChild(li);
    });
    card.appendChild(ul);

    const explain = src.explain || e.explain;
    if (explain) {
      const det = document.createElement('details');
      const sum = document.createElement('summary');
      sum.textContent = 'Xem lời giải';
      const body = document.createElement('div');
      body.className = 'explain-text';
      body.textContent = explain;
      det.append(sum, body);
      card.appendChild(det);
    }

    const note = document.createElement('textarea');
    note.className = 'note-input';
    note.rows = 2;
    note.placeholder = '📝 Ghi chú của bạn (mẹo nhớ, vì sao hay sai...)';
    note.value = e.note || '';
    note.addEventListener('input', () => { e.note = note.value; saveNotes(); });
    card.appendChild(note);

    notesList.appendChild(card);
  });
}

notesTabBtn.addEventListener('click', renderNotes);
notesFilter.addEventListener('change', renderNotes);
notesPracticeBtn.addEventListener('click', () => practiceEntries(visibleEntries().map((x) => x[1]), 'Sổ câu sai'));
notesClearDoneBtn.addEventListener('click', () => {
  const book = getBook();
  Object.keys(book).forEach((k) => { const e = book[k]; if (e.wrong > 0 && e.lastRight && !e.star && !e.note) delete book[k]; });
  saveNotes(); renderNotes();
});
notesExportBtn.addEventListener('click', () => {
  const lines = visibleEntries().map(([k, e], n) => {
    const correct = (Array.isArray(e.answer) ? e.answer : [e.answer]).map((i) => 'ABCD'[i]).join(', ');
    return (n + 1) + '. ' + e.q + '\n' + e.options.map((o, i) => '   ' + 'ABCD'[i] + '. ' + o).join('\n') + '\n   Đáp án đúng: ' + correct +
      (e.explain ? '\n   Lời giải: ' + e.explain.replace(/\n/g, ' ') : '') + (e.note ? '\n   Ghi chú của tôi: ' + e.note : '') + (e.star ? '\n   ⭐ Cần nhớ' : '') + '\n';
  });
  const blob = new Blob(['SỔ CÂU SAI - ' + sets[currentSet].name + '\n\n' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'so-cau-sai-' + sets[currentSet].name.replace(/[^\w\-]+/g, '_') + '.txt';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});


// =====================================================
// 7. LỜI GIẢI BẰNG AI (người dùng tự dán API key)
// =====================================================
// Key chỉ nằm trong trình duyệt của bạn, gửi thẳng tới hãng AI, không nằm trong file code.
const defaultModels = { claude: 'claude-haiku-5-5', gemini: 'gemini-flash-latest' };
let aiKey = '';
try { aiKey = localStorage.getItem('aiKey') || ''; } catch (e) {}
const aiPending = new WeakSet();   // các câu đang chờ AI trả lời (tránh gọi trùng)
let aiAutoTried = new WeakSet();   // các câu đã thử tự động rồi (nếu lỗi thì không tự gọi lại liên tục, bạn bấm nút để thử lại)
try { aiAuto.checked = localStorage.getItem('aiAuto') !== '0'; } catch (e) {}

// Đoán hãng AI theo đầu của key (hoặc theo hãng người dùng tự chọn trong "Tùy chọn nâng cao")
function detectProvider(key) {
  if (!key) return '';
  const manual = aiProviderSelect.value;
  if (manual === 'claude' || manual === 'gemini') return manual;
  if (/^sk-ant-/.test(key)) return 'claude';
  if (/^(AQ\.|AIza)/.test(key)) return 'gemini';   // Google đang đổi key Gemini từ "AIza..." sang "AQ...."
  if (/^sk-/.test(key)) return 'unsupported';      // OpenAI và một số hãng khác không cho gọi trực tiếp từ trình duyệt
  return 'unknown';
}

function updateAiStatus() {
  const provider = detectProvider(aiKey);
  aiModelInput.placeholder = 'mặc định: ' + (defaultModels[provider] || '...');
  aiStatus.classList.toggle('error', provider === 'unsupported' || provider === 'unknown');
  aiStatus.textContent = {
    '': 'Chưa có key.',
    claude: '✓ Nhận ra key Claude (model mặc định ' + defaultModels.claude + ').',
    gemini: '✓ Nhận ra key Gemini (model mặc định ' + defaultModels.gemini + ').',
    unsupported: 'Key OpenAI và một số hãng khác không gọi trực tiếp từ trình duyệt được (cần có máy chủ trung gian). Hãy dùng key Claude hoặc Gemini.',
    unknown: 'Chưa nhận ra loại key này. Hãy chọn hãng (Claude hoặc Gemini) trong "Tùy chọn nâng cao".'
  }[provider];
}

function saveAiKey() {
  try {
    if (aiRemember.checked && aiKey) localStorage.setItem('aiKey', aiKey);
    else localStorage.removeItem('aiKey');
  } catch (e) {}
}

aiKeyInput.value = aiKey;
aiRemember.checked = !!aiKey;
updateAiStatus();
aiKeyInput.addEventListener('input', () => { aiKey = aiKeyInput.value.trim(); updateAiStatus(); saveAiKey(); });
aiRemember.addEventListener('change', saveAiKey);
aiProviderSelect.addEventListener('change', updateAiStatus);
aiClearBtn.addEventListener('click', () => { aiKey = ''; aiKeyInput.value = ''; aiRemember.checked = false; saveAiKey(); updateAiStatus(); });

// Tạo lỗi kèm mã trạng thái (401, 404, 429...) để báo lỗi dễ hiểu
function aiError(res, data) {
  const err = new Error((data && data.error && data.error.message) || ('Lỗi ' + res.status));
  err.status = res.status;
  return err;
}

// Gọi 1 hãng AI với 1 model cụ thể
async function callProvider(provider, model, prompt) {
  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': aiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'     // bắt buộc khi gọi từ trình duyệt
      },
      body: JSON.stringify({ model: model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw aiError(res, data);
    // Kết quả có thể gồm nhiều khối (kể cả khối "thinking"), ta chỉ lấy các khối chữ
    return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  }

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': aiKey },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw aiError(res, data);
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  return (parts || []).map((p) => p.text || '').join('');
}

// Gửi câu hỏi tới AI. Nếu bạn không tự nhập model, app thử lần lượt vài model Gemini khi 1 model báo "không tìm thấy".
async function askAI(provider, prompt) {
  const userModel = aiModelInput.value.trim();
  const candidates = userModel ? [userModel]
    : provider === 'gemini' ? [defaultModels.gemini, 'gemini-3.5-flash', 'gemini-2.5-flash']
    : [defaultModels.claude];
  let lastError;
  for (const model of candidates) {
    try { return await callProvider(provider, model, prompt); }
    catch (e) { lastError = e; if (e.status !== 404) throw e; }
  }
  throw lastError;
}

// Đổi lỗi kỹ thuật thành câu dễ hiểu
function describeAiError(e) {
  if (e instanceof TypeError || (e && e.name === 'TypeError')) {   // fetch bị chặn (mạng, CORS hoặc trang chạy thử bị chặn gọi ra ngoài)
    return 'Không gọi được tới dịch vụ AI. Nếu bạn đang xem bản chạy thử trên claude.ai thì trang này bị chặn gọi ra ngoài: hãy mở file index.html trên máy. Cũng có thể do mạng bị chặn.';
  }
  const msg = String((e && e.message) || e);
  if (/ACCESS_TOKEN_TYPE_UNSUPPORTED/.test(msg)) return 'Google từ chối loại key này (một số tài khoản đang gặp lỗi khi Google đổi sang key "AQ."). Hãy xóa key cũ và tạo key mới ngay trong Google AI Studio. (' + msg + ')';
  if (e.status === 401 || (e.status === 400 && /api key not valid|invalid.*key/i.test(msg))) return 'Key không được chấp nhận. Kiểm tra lại key (dán đủ, không thừa ký tự) hoặc tạo key mới. (' + msg + ')';
  if (e.status === 403) return 'Key không có quyền dùng dịch vụ này hoặc khu vực của bạn chưa được hỗ trợ. (' + msg + ')';
  if (e.status === 404) return 'Không tìm thấy model. Mở "Tùy chọn nâng cao" và nhập tên model khác. (' + msg + ')';
  if (e.status === 429) return 'Key đã hết hạn mức (quota) hoặc gói miễn phí không dùng được ở dự án này. Chờ vài phút hoặc dùng key khác. (' + msg + ')';
  return 'Lỗi từ dịch vụ AI: ' + msg;
}

function showAiNote(text) {
  aiNote.hidden = false;
  aiNote.textContent = text;
}

// Nhờ AI viết lời giải cho câu số idx. auto = true nghĩa là app tự gọi (không phải bạn bấm nút).
async function generateExplanation(idx, auto) {
  const item = activeQuestions[idx];
  const chosen = answers[idx];
  const provider = detectProvider(aiKey);

  if (!provider) {
    if (!auto) { showAiNote('Hãy dán API key vào khung "Lời giải bằng AI" ở cột bên trái trước.'); aiKeyInput.focus(); }
    return;
  }
  if (provider === 'unsupported' || provider === 'unknown') { if (!auto) showAiNote(aiStatus.textContent); return; }
  if (!item || item.explain || chosen === undefined || aiPending.has(item)) return;

  const prompt =
    'Bạn là gia sư môn kinh tế - tài chính. Hãy viết lời giải ngắn gọn bằng tiếng Việt (giữ nguyên thuật ngữ tiếng Anh) cho câu trắc nghiệm sau.\n\n' +
    'Câu hỏi: ' + item.q + '\n' +
    item.options.map((o, i) => 'ABCD'[i] + '. ' + o).join('\n') + '\n\n' +
    'Đáp án đúng theo đề: ' + (Array.isArray(item.answer) ? item.answer : [item.answer]).map((i) => 'ABCD'[i] + '. ' + item.options[i]).join('; ') + '\n' +
    (!isCorrect(item, chosen) ? 'Người học đã chọn: ' + (Array.isArray(chosen) ? chosen : [chosen]).map((i) => 'ABCD'[i]).join(', ') + ' (sai).\n' : '') +
    '\nYêu cầu: (1) giải thích vì sao đáp án đúng là đúng, nếu có tính toán thì ghi từng bước ngắn gọn; ' +
    '(2) nếu người học chọn sai, nói ngắn gọn vì sao đáp án đã chọn sai; (3) tối đa 120 từ; ' +
    '(4) chỉ dùng chữ thường, không dùng markdown hay LaTeX; ' +
    '(5) nếu đáp án theo đề có vẻ không khớp với phép tính hoặc kiến thức đúng, hãy nói rõ điều đó.';

  aiPending.add(item);
  if (qIndex === idx) {
    aiExplainBtn.disabled = true;
    aiExplainBtn.textContent = 'Đang tạo lời giải...';
    showAiNote('🤖 Đang nhờ AI viết lời giải...');
  }
  try {
    const text = (await askAI(provider, prompt)).trim();
    if (!text) throw new Error('AI không trả về nội dung.');
    item.explain = text;                 // lưu vào bộ đề để lần sau không phải gọi lại
    item.ai = true;
    saveUploadedSets();
    if (qIndex === idx) {                // chỉ cập nhật màn hình nếu người dùng vẫn đang ở câu này
      explainText.textContent = text;
      aiExplainBtn.hidden = true;
      showAiNote('🤖 Lời giải do AI tạo, có thể chưa chính xác. Hãy đối chiếu giáo trình.');
    }
  } catch (e) {
    if (qIndex === idx) {
      aiExplainBtn.disabled = false;
      aiExplainBtn.textContent = '🤖 Tạo lời giải bằng AI';
      showAiNote(describeAiError(e));
    }
  } finally {
    aiPending.delete(item);
  }
}

// Tự gọi AI cho câu hiện tại nếu: đã trả lời, chưa có lời giải, đã bật "Tự tạo", và có key dùng được
function maybeAutoExplain() {
  const item = activeQuestions[qIndex];
  if (!item || answers[qIndex] === undefined || item.explain || !aiAuto.checked) return;
  if (aiPending.has(item) || aiAutoTried.has(item)) return;
  const provider = detectProvider(aiKey);
  if (provider !== 'claude' && provider !== 'gemini') return;
  aiAutoTried.add(item);                 // mỗi câu chỉ tự gọi 1 lần; nếu lỗi bạn bấm nút để thử lại
  generateExplanation(qIndex, true);
}

// Bấm nút "Tạo lời giải bằng AI" (dùng khi muốn thử lại hoặc đang tắt chế độ tự động)
aiExplainBtn.addEventListener('click', () => generateExplanation(qIndex, false));

// Bật/tắt "Tự tạo lời giải" và dán key xong (rời khỏi ô nhập) thì áp dụng ngay cho câu đang xem
aiAuto.addEventListener('change', () => {
  try { localStorage.setItem('aiAuto', aiAuto.checked ? '1' : '0'); } catch (e) {}
  aiAutoTried = new WeakSet();
  maybeAutoExplain();
});
aiKeyInput.addEventListener('change', () => { aiAutoTried = new WeakSet(); maybeAutoExplain(); });

// Nút "Thử kết nối": gửi 1 câu rất ngắn để kiểm tra key và model có chạy được không
aiTestBtn.addEventListener('click', async () => {
  const provider = detectProvider(aiKey);
  if (!provider || provider === 'unsupported' || provider === 'unknown') {
    updateAiStatus();
    if (!provider) aiStatus.textContent = 'Hãy dán API key trước.';
    return;
  }
  aiTestBtn.disabled = true;
  aiStatus.classList.remove('error');
  aiStatus.textContent = 'Đang thử kết nối...';
  try {
    const text = await askAI(provider, 'Chỉ trả lời đúng một từ: OK');
    aiStatus.textContent = '✓ Kết nối được. AI trả lời: ' + (text.trim().slice(0, 40) || '(trống)');
  } catch (e) {
    aiStatus.classList.add('error');
    aiStatus.textContent = describeAiError(e);
  }
  aiTestBtn.disabled = false;
});

// Mở lại đúng bộ đề đang làm dở lần trước
const lastIndex = sets.findIndex((s) => s.name === progressStore._last);
if (lastIndex >= 0) currentSet = lastIndex;
renderSetSelect();
openSet();