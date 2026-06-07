// Seeds an admin user, global settings, and 3 demo case studies with varied
// block sets so the page-builder is immediately visible in action.
// Run: npm run db:seed
import { PrismaClient, type Prisma } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || "./uploads");
const SEED_SUBDIR = "seed";

const GRADIENTS = {
  blue: ["#1b2a5b", "#5b8cff"],
  violet: ["#2a1b4b", "#a855f7"],
  teal: ["#0b3b3b", "#2dd4bf"],
  sunset: ["#4b1b1b", "#fb923c"],
  slate: ["#1a1a1f", "#3f3f46"],
};

let imageCounter = 0;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Generate a labelled gradient placeholder image, persist it, and create a
// Media row. Returns an image value usable inside block data.
async function makeImage(
  label: string,
  w: number,
  h: number,
  grad: keyof typeof GRADIENTS,
  alt: string
) {
  const [c1, c2] = GRADIENTS[grad] ?? GRADIENTS.blue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="${Math.round(w / 18)}"
      fill="#ffffff" fill-opacity="0.92" text-anchor="middle" dominant-baseline="middle"
      font-weight="700">${esc(label)}</text>
  </svg>`;

  const buf = await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
  imageCounter += 1;
  const fileName = `img-${String(imageCounter).padStart(2, "0")}-${grad}-${w}x${h}.webp`;
  const key = `${SEED_SUBDIR}/${fileName}`;
  await fs.mkdir(path.join(UPLOADS_DIR, SEED_SUBDIR), { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, key), buf);

  const media = await prisma.media.upsert({
    where: { key },
    update: { url: `/uploads/${key}`, alt, width: w, height: h, mimeType: "image/webp" },
    create: { key, url: `/uploads/${key}`, alt, width: w, height: h, mimeType: "image/webp", size: buf.length },
  });

  return {
    mediaId: media.id,
    url: media.url,
    alt,
    width: w,
    height: h,
  };
}

type BlockSeed = { type: string; data: unknown; isVisible?: boolean };

async function createProject(args: {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  year: number;
  isFeatured: boolean;
  sort: number;
  seoDescription: string;
  cover: { mediaId: string };
  blocks: BlockSeed[];
}) {
  // Reset any prior seed of this slug (cascades to page + blocks).
  await prisma.project.deleteMany({ where: { slug: args.slug } });

  const project = await prisma.project.create({
    data: {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      tags: args.tags,
      year: args.year,
      status: "PUBLISHED",
      isFeatured: args.isFeatured,
      sort: args.sort,
      cover: { connect: { id: args.cover.mediaId } },
      seoDescription: args.seoDescription,
      page: { create: { status: "PUBLISHED" } },
    },
  });

  await prisma.block.createMany({
    data: args.blocks.map((b, i) => ({
      pageId: project.pageId,
      type: b.type,
      sort: i,
      isVisible: b.isVisible ?? true,
      data: b.data as Prisma.InputJsonValue,
    })),
  });

  return project;
}

async function main() {
  // Clean previous seed media + files so reruns don't leave orphans.
  // (Optional Project.cover relation is set null automatically on media delete.)
  await prisma.project.deleteMany({
    where: { slug: { in: ["marketplace-analytics", "mobile-bank-onboarding", "saas-billing"] } },
  });
  await prisma.media.deleteMany({ where: { key: { startsWith: `${SEED_SUBDIR}/` } } });
  await fs.rm(path.join(UPLOADS_DIR, SEED_SUBDIR), { recursive: true, force: true });

  // --- Admin user ---
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await hash(password), name: "Admin" },
  });

  // --- Settings ---
  await prisma.setting.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      siteName: "Алексей Иванов",
      role: "Фриланс fullstack-разработчик",
      heroTitle: "Создаю веб-продукты, которые приносят результат",
      heroSubtitle:
        "Проектирую и разрабатываю приложения на TypeScript, Next.js и Node — от идеи до production с прицелом на скорость, надёжность и метрики бизнеса.",
      email: "hello@example.com",
      telegram: "https://t.me/example",
      github: "https://github.com/example",
      contactText:
        "Опишите задачу — отвечу в течение дня с оценкой сроков и предложением по реализации.",
    },
  });

  // === Demo case 1: маркетплейс-аналитика ===
  const c1cover = await makeImage("Аналитика", 1600, 1000, "blue", "Обложка кейса аналитики");
  const c1shot1 = await makeImage("Дашборд", 800, 600, "blue", "Скриншот дашборда");
  const c1shot2 = await makeImage("Отчёты", 800, 600, "teal", "Скриншот отчётов");
  const c1shot3 = await makeImage("Сегменты", 800, 600, "violet", "Скриншот сегментов");
  const c1arch = await makeImage("Архитектура", 1600, 900, "slate", "Схема архитектуры");
  const c1show = await makeImage("Дашборд", 1600, 1000, "blue", "Showcase дашборда");

  await createProject({
    title: "Аналитическая платформа для маркетплейса",
    slug: "marketplace-analytics",
    excerpt:
      "Real-time дашборды для 12 000 продавцов: сократили время на принятие решений и подняли удержание.",
    tags: ["Next.js", "PostgreSQL", "ClickHouse", "Аналитика"],
    year: 2025,
    isFeatured: true,
    sort: 0,
    seoDescription: "Кейс: построение аналитической платформы для маркетплейса.",
    cover: c1cover,
    blocks: [
      {
        type: "hero-case",
        data: {
          title: "Аналитическая платформа для маркетплейса",
          subtitle: "Real-time дашборды и сегментация для 12 000 продавцов",
          cover: c1cover,
          tags: ["B2B", "Аналитика", "SaaS"],
        },
      },
      {
        type: "text",
        data: {
          width: "normal",
          markdown:
            "## Контекст\n\nКрупный маркетплейс терял продавцов из-за того, что они не понимали, **что именно** влияет на их продажи. Существующие отчёты строились ночью и были неудобны.\n\nЗадача — дать продавцам понятную аналитику в реальном времени.",
        },
      },
      {
        type: "problem-solution",
        data: {
          problemTitle: "Проблема",
          problem:
            "- Отчёты обновлялись раз в сутки\n- Нет сегментации по товарам и регионам\n- Высокий отток новых продавцов",
          solutionTitle: "Решение",
          solution:
            "- Стриминг событий в ClickHouse\n- Конструктор сегментов и фильтров\n- Онбординг с подсказками по метрикам",
        },
      },
      {
        type: "metrics",
        data: {
          items: [
            { value: "−40%", label: "время на анализ" },
            { value: "+18%", label: "удержание продавцов" },
            { value: "12k", label: "активных продавцов" },
            { value: "<200мс", label: "отклик дашборда" },
          ],
        },
      },
      { type: "showcase", data: { image: c1show, frame: "browser", gradient: "accent" } },
      { type: "gallery", data: { columns: 3, images: [c1shot1, c1shot2, c1shot3] } },
      {
        type: "tech-stack",
        data: {
          title: "Стек технологий",
          items: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "ClickHouse", "Redis", "Docker"],
        },
      },
      {
        type: "arch-diagram",
        data: { image: c1arch, caption: "Поток данных от событий до дашборда" },
      },
      {
        type: "timeline",
        data: {
          items: [
            { date: "Месяц 1", title: "Исследование и метрики", description: "Интервью с продавцами, выбор ключевых показателей." },
            { date: "Месяц 2", title: "MVP дашборда", description: "Первые графики в реальном времени." },
            { date: "Месяц 3", title: "Сегменты и онбординг", description: "Конструктор фильтров, подсказки." },
          ],
        },
      },
      {
        type: "quote",
        data: {
          text: "Впервые мы видим продажи в реальном времени — решения стали быстрее и точнее.",
          author: "Product Lead",
          role: "Маркетплейс",
        },
      },
      {
        type: "cta",
        data: {
          title: "Нужна похожая аналитика?",
          text: "Расскажите о задаче — предложу архитектуру и оценку.",
          buttonLabel: "Обсудить проект",
          useContactForm: false,
        },
      },
    ],
  });

  // === Demo case 2: мобильный онбординг ===
  const c2cover = await makeImage("Онбординг", 1600, 1000, "violet", "Обложка кейса онбординга");
  const c2phone = await makeImage("Экран", 400, 800, "violet", "Экран мобильного приложения");

  await createProject({
    title: "Онбординг мобильного банка",
    slug: "mobile-bank-onboarding",
    excerpt:
      "Переработали регистрацию в банковском приложении — конверсия в активацию выросла на 27%.",
    tags: ["React Native", "UX", "Финтех"],
    year: 2024,
    isFeatured: true,
    sort: 1,
    seoDescription: "Кейс: редизайн онбординга мобильного банка.",
    cover: c2cover,
    blocks: [
      {
        type: "hero-case",
        data: {
          title: "Онбординг мобильного банка",
          subtitle: "Регистрация за 3 шага вместо 7",
          cover: c2cover,
          tags: ["Mobile", "Финтех", "UX"],
        },
      },
      {
        type: "problem-solution",
        data: {
          problemTitle: "Было",
          problem: "Семишаговая регистрация с высоким отвалом на верификации.",
          solutionTitle: "Стало",
          solution: "Три шага, автозаполнение и прогрессивная верификация.",
        },
      },
      { type: "showcase", data: { image: c2phone, frame: "phone", gradient: "violet" } },
      {
        type: "metrics",
        data: {
          items: [
            { value: "+27%", label: "активация" },
            { value: "−55%", label: "отвал на верификации" },
            { value: "3", label: "шага вместо 7" },
          ],
        },
      },
      {
        type: "media",
        data: {
          kind: "embed",
          embedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          caption: "Демо нового онбординга",
        },
      },
      {
        type: "tech-stack",
        data: { title: "Технологии", items: ["React Native", "TypeScript", "GraphQL", "Detox"] },
      },
      {
        type: "cta",
        data: {
          title: "Обсудим ваш продукт?",
          text: "",
          buttonLabel: "Связаться",
          useContactForm: true,
        },
      },
    ],
  });

  // === Demo case 3: SaaS-биллинг ===
  const c3cover = await makeImage("Биллинг", 1600, 1000, "teal", "Обложка кейса биллинга");
  const c3arch = await makeImage("Сервисы", 1600, 900, "slate", "Схема сервисов биллинга");

  await createProject({
    title: "Биллинг для B2B SaaS",
    slug: "saas-billing",
    excerpt: "Гибкая тарификация, подписки и инвойсы с интеграцией платёжных провайдеров.",
    tags: ["Node.js", "Stripe", "Биллинг"],
    year: 2024,
    isFeatured: false,
    sort: 2,
    seoDescription: "Кейс: система биллинга для B2B SaaS.",
    cover: c3cover,
    blocks: [
      {
        type: "hero-case",
        data: {
          title: "Биллинг для B2B SaaS",
          subtitle: "Подписки, тарифные планы и инвойсы под ключ",
          cover: c3cover,
          tags: ["SaaS", "Биллинг", "Backend"],
        },
      },
      {
        type: "text",
        data: {
          width: "normal",
          markdown:
            "## Задача\n\nПродукту требовалась гибкая система тарификации: посайтовые планы, пробные периоды, скидки и корректные инвойсы для юр. лиц.",
        },
      },
      { type: "arch-diagram", data: { image: c3arch, caption: "Сервисы биллинга и интеграции" } },
      {
        type: "metrics",
        data: {
          items: [
            { value: "99.99%", label: "точность начислений" },
            { value: "6", label: "платёжных методов" },
            { value: "0", label: "ручных инвойсов" },
          ],
        },
      },
      {
        type: "tech-stack",
        data: { title: "Стек", items: ["Node.js", "NestJS", "PostgreSQL", "Stripe", "RabbitMQ"] },
      },
      {
        type: "quote",
        data: {
          text: "Биллинг просто работает — мы забыли про ручные сверки.",
          author: "CFO",
          role: "SaaS-компания",
        },
      },
      { type: "spacer", data: { size: "md", divider: true } },
      {
        type: "cta",
        data: { title: "Нужен надёжный биллинг?", text: "", buttonLabel: "Обсудить", useContactForm: false },
      },
    ],
  });

  // === About page ===
  await prisma.block.deleteMany({ where: { page: { key: "about" } } });
  const about = await prisma.page.upsert({
    where: { key: "about" },
    update: { status: "PUBLISHED" },
    create: { key: "about", status: "PUBLISHED" },
  });
  await prisma.block.createMany({
    data: [
      {
        pageId: about.id,
        type: "text",
        sort: 0,
        data: {
          width: "normal",
          markdown:
            "# Обо мне\n\nЯ fullstack-разработчик с фокусом на продуктовую разработку. Помогаю командам и основателям доводить идеи до работающих, масштабируемых продуктов.\n\nРаботаю на стыке инженерии и продукта: проектирую архитектуру, пишу код и держу в голове метрики бизнеса.",
        } as Prisma.InputJsonValue,
      },
      {
        pageId: about.id,
        type: "metrics",
        sort: 1,
        data: {
          items: [
            { value: "8+", label: "лет в разработке" },
            { value: "40+", label: "проектов" },
            { value: "15+", label: "довольных клиентов" },
          ],
        } as Prisma.InputJsonValue,
      },
      {
        pageId: about.id,
        type: "tech-stack",
        sort: 2,
        data: {
          title: "Чем владею",
          items: ["TypeScript", "React / Next.js", "Node.js", "PostgreSQL", "Docker", "AWS"],
        } as Prisma.InputJsonValue,
      },
      {
        pageId: about.id,
        type: "cta",
        sort: 3,
        data: { title: "Обсудим сотрудничество?", text: "", buttonLabel: "Связаться", useContactForm: false } as Prisma.InputJsonValue,
      },
    ],
  });

  console.log("✔ Сид завершён: 3 кейса, страница «Обо мне», настройки и админ.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
