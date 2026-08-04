import db from '../db.js';

console.log('Seeding database...');

// ===== 语言 =====
const insertLang = db.prepare('INSERT OR IGNORE INTO languages (code, name, name_en, flag, description) VALUES (?,?,?,?,?)');
const langs = [
  ['en', '英语', 'English', '🇬🇧', '全球通用语言，掌握英语打开世界之门'],
  ['ja', '日语', '日本語', '🇯🇵', '学习日语，感受日本文化之美'],
  ['ko', '韩语', '한국어', '🇰🇷', '韩流来袭，从韩语开始'],
];
const insertMany = db.transaction(() => { langs.forEach(l => insertLang.run(...l)); });
insertMany();

// ===== 等级 =====
const insertLevel = db.prepare('INSERT OR IGNORE INTO levels (language_id, name, level_order, description) VALUES (?,?,?,?)');
const levelData = [];
for (const [langIdx, langCode] of ['en', 'ja', 'ko'].entries()) {
  const lid = langIdx + 1;
  levelData.push([lid, '入门', 1, '零基础入门，学习字母和基本发音']);
  levelData.push([lid, '初级', 2, '掌握日常基本会话']);
  levelData.push([lid, '中级', 3, '能够进行复杂对话和阅读']);
  levelData.push([lid, '高级', 4, '接近母语水平，流利表达']);
}
const insertLevels = db.transaction(() => { levelData.forEach(l => insertLevel.run(...l)); });
insertLevels();

// ===== 课程 =====
const insertCourse = db.prepare('INSERT OR IGNORE INTO courses (language_id, level_id, title, description, category, order_num, xp_reward) VALUES (?,?,?,?,?,?,?)');
const courses = [];

// 英语课程
for (let lid = 1; lid <= 4; lid++) {
  courses.push([1, lid, `英语${['入门','初级','中级','高级'][lid-1]}词汇`, '核心词汇学习，图文并茂记忆法', 'vocabulary', 1, 10]);
  courses.push([1, lid, `英语${['入门','初级','中级','高级'][lid-1]}语法`, '系统语法讲解与练习', 'grammar', 2, 15]);
  courses.push([1, lid, `英语${['入门','初级','中级','高级'][lid-1]}口语`, '情景对话与发音练习', 'speaking', 3, 20]);
  courses.push([1, lid, `英语${['入门','初级','中级','高级'][lid-1]}听力`, '沉浸式听力训练', 'listening', 4, 15]);
}

// 日语课程
for (let lid = 5; lid <= 8; lid++) {
  courses.push([2, lid, `日语${['入门','初级','中级','高级'][lid-5]}词汇`, '五十音到核心词汇', 'vocabulary', 1, 10]);
  courses.push([2, lid, `日语${['入门','初级','中级','高级'][lid-5]}语法`, '日语语法体系学习', 'grammar', 2, 15]);
  courses.push([2, lid, `日语${['入门','初级','中级','高级'][lid-5]}口语`, '日常会话与敬语练习', 'speaking', 3, 20]);
  courses.push([2, lid, `日语${['入门','初级','中级','高级'][lid-5]}听力`, '日剧动漫听力训练', 'listening', 4, 15]);
}

// 韩语课程
for (let lid = 9; lid <= 12; lid++) {
  courses.push([3, lid, `韩语${['入门','初级','中级','高级'][lid-9]}词汇`, '韩文字母到实用词汇', 'vocabulary', 1, 10]);
  courses.push([3, lid, `韩语${['入门','初级','中级','高级'][lid-9]}语法`, '韩语语法体系学习', 'grammar', 2, 15]);
  courses.push([3, lid, `韩语${['入门','初级','中级','高级'][lid-9]}口语`, '韩剧台词实用口语', 'speaking', 3, 20]);
  courses.push([3, lid, `韩语${['入门','初级','中级','高级'][lid-9]}听力`, 'K-pop与韩综听力训练', 'listening', 4, 15]);
}

const insertCourses = db.transaction(() => { courses.forEach(c => insertCourse.run(...c)); });
insertCourses();

// ===== 词汇数据 =====
const insertWord = db.prepare('INSERT OR IGNORE INTO vocabulary (course_id, word, translation, pronunciation, example_sentence) VALUES (?,?,?,?,?)');

const enVocab = [
  [1, 'hello', '你好', '/həˈloʊ/', 'Hello, how are you today?'],
  [1, 'world', '世界', '/wɜːrld/', 'The world is a beautiful place.'],
  [1, 'friend', '朋友', '/frend/', 'She is my best friend.'],
  [1, 'family', '家庭', '/ˈfæməli/', 'I love my family very much.'],
  [1, 'school', '学校', '/skuːl/', 'I go to school every day.'],
  [1, 'book', '书', '/bʊk/', 'This book is very interesting.'],
  [1, 'water', '水', '/ˈwɔːtər/', 'Please give me some water.'],
  [1, 'food', '食物', '/fuːd/', 'The food here is delicious.'],
  [5, 'beautiful', '美丽的', '/ˈbjuːtɪfəl/', 'What a beautiful sunset!'],
  [5, 'important', '重要的', '/ɪmˈpɔːrtənt/', 'This is very important.'],
  [5, 'experience', '经验', '/ɪkˈspɪriəns/', 'Travel is a great experience.'],
  [5, 'opportunity', '机会', '/ˌɑːpərˈtuːnəti/', 'This is a great opportunity.'],
  [9, 'sophisticated', '精密的', '/səˈfɪstɪkeɪtɪd/', 'The technology is very sophisticated.'],
  [9, 'phenomenon', '现象', '/fɪˈnɑːmɪnən/', 'This is a natural phenomenon.'],
  [9, 'extraordinary', '非凡的', '/ɪkˈstrɔːrdəneri/', 'She has extraordinary talent.'],
  [13, 'eloquent', '雄辩的', '/ˈeləkwənt/', 'He gave an eloquent speech.'],
  [13, 'meticulous', '一丝不苟的', '/məˈtɪkjələs/', 'She is meticulous in her work.'],
];

const jaVocab = [
  [17, 'こんにちは', '你好', 'konnichiwa', 'こんにちは、お元気ですか？'],
  [17, 'ありがとう', '谢谢', 'arigatou', 'ありがとうございます。'],
  [17, 'すみません', '对不起/打扰了', 'sumimasen', 'すみません、駅はどこですか？'],
  [17, 'おはよう', '早上好', 'ohayou', 'おはようございます、先生。'],
  [17, 'さようなら', '再见', 'sayounara', 'さようなら、また明日。'],
  [21, '勉強', '学习', 'benkyou', '日本語を勉強しています。'],
  [21, '旅行', '旅行', 'ryokou', '日本へ旅行に行きたいです。'],
  [21, '美味しい', '好吃的', 'oishii', 'このラーメンは美味しいです。'],
  [25, '努力', '努力', 'doryoku', '努力は必ず報われる。'],
  [25, '挑戦', '挑战', 'chousen', '新しいことに挑戦する。'],
  [29, '切磋琢磨', '切磋琢磨', 'sessatakuma', '切磋琢磨して成長する。'],
  [29, '一期一会', '一期一会', 'ichigoichie', '一期一会の出会いを大切に。'],
];

const koVocab = [
  [33, '안녕하세요', '你好', 'annyeonghaseyo', '안녕하세요, 반갑습니다.'],
  [33, '감사합니다', '谢谢', 'gamsahamnida', '도와주셔서 감사합니다.'],
  [33, '사랑해요', '我爱你', 'saranghaeyo', '엄마, 사랑해요!'],
  [33, '미안합니다', '对不起', 'mianhamnida', '늦어서 미안합니다.'],
  [33, '맛있어요', '好吃', 'masisseoyo', '김치가 정말 맛있어요.'],
  [37, '친구', '朋友', 'chingu', '제 친구를 소개할게요.'],
  [37, '여행', '旅行', 'yeohaeng', '한국으로 여행 가고 싶어요.'],
  [37, '공부', '学习', 'gongbu', '한국어를 공부하고 있어요.'],
  [41, '도전', '挑战', 'dojeon', '새로운 도전을 시작했어요.'],
  [41, '성공', '成功', 'seonggong', '성공을 위해서 열심히 할게요.'],
  [45, '소통', '沟通', 'sotong', '소통이 가장 중요합니다.'],
  [45, '열정', '热情', 'yeoljeong', '열정을 가지고 살아요.'],
];

const insertWords = db.transaction(() => {
  [...enVocab, ...jaVocab, ...koVocab].forEach(w => insertWord.run(...w));
});
insertWords();

// ===== 语法题 =====
const insertGrammar = db.prepare('INSERT OR IGNORE INTO grammar_questions (course_id, question, options, correct_index, explanation) VALUES (?,?,?,?,?)');

const grammarQs = [
  [2, 'She ___ to school every day.', '["go","goes","going","gone"]', 1, '第三人称单数用 goes'],
  [2, 'There ___ many books on the table.', '["is","are","am","be"]', 1, '复数名词用 are'],
  [2, 'I have ___ finished my homework.', '["yet","already","still","never"]', 1, 'already 用于肯定句，表示"已经"'],
  [6, 'If I ___ rich, I would travel the world.', '["am","was","were","be"]', 2, '虚拟语气中用 were'],
  [6, 'The book ___ by Mark Twain.', '["wrote","was written","written","writing"]', 1, '被动语态用 was written'],
  [10, 'Not only ___ but also she sings well.', '["she dances","dances she","does she dance","she does dance"]', 2, 'Not only 开头用倒装'],
  [18, '私は学生___。', '["です","ます","だ","ある"]', 0, '名词句结尾用 です'],
  [18, 'これは___本ですか？', '["だれ","どこ","なん","なに"]', 2, '"什么"用 なん'],
  [22, '食べ___後で、勉強します。', '["た","て","る","ます"]', 0, 'た形 + 後で 表示"之后"'],
  [34, '저___ 학생입니다.', '["는","가","을","의"]', 0, '主语后用 는'],
  [34, '물___ 주세요.', '["을","를","이","가"]', 1, '宾语后用 를'],
];

const insertGrammarQs = db.transaction(() => { grammarQs.forEach(q => insertGrammar.run(...q)); });
insertGrammarQs();

// ===== 口语提示 =====
const insertSpeaking = db.prepare('INSERT OR IGNORE INTO speaking_prompts (course_id, prompt_text, reference_text, tips) VALUES (?,?,?,?)');

const speakingData = [
  [3, 'Introduce yourself', 'Hello, my name is [Name]. I am from [Country]. I like [hobby]. Nice to meet you!', '注意语调自然，name 和 country 替换成自己的信息'],
  [3, 'Order food at a restaurant', 'Excuse me, I would like to order [food]. Could I also have [drink]? Thank you!', '用礼貌的语气，would like 比 want 更礼貌'],
  [7, 'Describe your last vacation', 'Last summer, I went to [place]. The weather was [adjective]. I enjoyed [activity] the most.', '用过去时态，描述具体细节'],
  [11, 'Give a short presentation on technology', 'Today I would like to talk about [topic]. Technology has changed our lives by [point 1] and [point 2].', '语调要有起伏，重点词强调'],
  [19, '自己紹介してください', 'こんにちは、[名前]と申します。[国]から来ました。趣味は[趣味]です。', '注意です・ます体的使用'],
  [23, 'レストランで注文する', 'すみません、[料理]をください。それと[飲み物]もお願いします。', 'くださいます和お願いします的使用场景'],
  [35, '자기소개 해주세요', '안녕하세요, 저는 [이름]입니다. [국가]에서 왔어요. 취미는 [취미]입니다.', '注意 입니다/입니다 的正式语气'],
  [39, '식당에서 주문하기', '저기요, [음식] 하나 주세요. 그리고 [음료]도 주세요.', '주세요 的使用和语调'],
];

const insertSpeakingData = db.transaction(() => { speakingData.forEach(s => insertSpeaking.run(...s)); });
insertSpeakingData();

// ===== 听力练习 =====
const insertListening = db.prepare('INSERT OR IGNORE INTO listening_exercises (course_id, audio_text, question, options, correct_index, transcript) VALUES (?,?,?,?,?,?)');

const listeningData = [
  [4, 'Good morning. The weather today will be sunny with a high of 25 degrees.', 'What is the weather like today?', '["Rainy","Sunny","Cloudy","Snowy"]', 1, 'Good morning. The weather today will be sunny with a high of 25 degrees.'],
  [4, 'Excuse me, where is the nearest subway station? Go straight and turn left.', 'Where should the person turn?', '["Right","Left","Go back","Stop"]', 1, 'Excuse me, where is the nearest subway station? Go straight and turn left.'],
  [8, 'The company announced record profits this quarter, exceeding analyst expectations by 15 percent.', 'By what percentage did profits exceed expectations?', '["5%","10%","15%","20%"]', 2, 'The company announced record profits this quarter, exceeding analyst expectations by 15 percent.'],
  [20, '今日はいい天気ですね。公園に行きませんか？', '天気はどうですか？', '["悪い","いい","暑い","寒い"]', 1, '今日はいい天気ですね。公園に行きませんか？'],
  [24, 'すみません、この電車は東京駅に行きますか？', 'この電車はどこに行きますか？', '["大阪駅","東京駅","京都駅","新宿駅"]', 1, 'すみません、この電車は東京駅に行きますか？'],
  [36, '오늘 날씨가 정말 좋네요. 같이 산책할래요?', '오늘 날씨가 어때요?', '["나빠요","좋아요","추워요","더워요"]', 1, '오늘 날씨가 정말 좋네요. 같이 산책할래요?'],
  [40, '실례합니다, 이 버스가 명동에 가나요?', '버스가 어디에 가나요?', '["홍대","강남","명동","이태원"]', 2, '실례합니다, 이 버스가 명동에 가나요?'],
];

const insertListeningData = db.transaction(() => { listeningData.forEach(l => insertListening.run(...l)); });
insertListeningData();

// ===== 成就 =====
const insertAchievement = db.prepare('INSERT OR IGNORE INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES (?,?,?,?,?,?)');

const achievements = [
  ['初次登录', '完成首次登录', '🎉', 'login', 1, 10],
  ['学习新星', '完成5个课程', '⭐', 'courses_completed', 5, 50],
  ['学习达人', '完成20个课程', '🌟', 'courses_completed', 20, 100],
  ['词汇大师', '学习50个单词', '📚', 'vocab_learned', 50, 80],
  ['语法高手', '完成10个语法练习', '✏️', 'grammar_done', 10, 60],
  ['口语达人', '完成5个口语练习', '🎤', 'speaking_done', 5, 60],
  ['听力专家', '完成10个听力练习', '🎧', 'listening_done', 10, 60],
  ['连续打卡', '连续学习7天', '🔥', 'streak_days', 7, 100],
  ['社区活跃', '发布5条社区帖子', '💬', 'posts', 5, 50],
  ['全能选手', '所有类型课程各完成至少1个', '🏆', 'all_types', 1, 150],
];

const insertAchievements = db.transaction(() => { achievements.forEach(a => insertAchievement.run(...a)); });
insertAchievements();

console.log('Database seeded successfully!');
db.close();