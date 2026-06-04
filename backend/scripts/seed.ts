import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/modules/users/model/user.model';
import { PostModel } from '../src/modules/blog/model/post.model';

/**
 * Demo seed script — loads test users + posts straight into Postgres via TypeORM
 * (no need to run the API server).
 *
 *   npm run seed              additive: skips users whose email already exists
 *   npm run seed -- --reset   clears ALL users + posts first, then seeds fresh
 *
 * DB settings mirror src/app.module.ts; override with PG* env vars if your local
 * Postgres differs (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE).
 *
 * Every demo account shares the same password (below) so you can log in as any
 * of them while recording.
 */

const DEMO_PASSWORD = 'password123'; // satisfies the 8-char signup rule

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  username: process.env.PGUSER ?? 'pullist',
  password: process.env.PGPASSWORD ?? '',
  database: process.env.PGDATABASE ?? 'rpg_assignment',
  entities: [User, PostModel],
  synchronize: true, // matches app.module.ts; creates the tables if missing
});

interface SeedUser {
  email: string;
  // Listed oldest-first. Rows are inserted in array order, so the last post gets
  // the highest id and therefore appears first in the frontend's newest-first list.
  posts: { title: string; body: string }[];
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'ada@example.com',
    posts: [
      {
        title: 'Notes on the Analytical Engine',
        body: "Spent the afternoon sketching how a sequence of operations could be encoded on cards. The machine doesn't merely calculate — it manipulates symbols.",
      },
      {
        title: 'Loops are everywhere',
        body: 'Repeating a set of instructions with small variations is the heart of computation. Wrote out my first table of recurring operations today.',
      },
      {
        title: 'On imagination in mathematics',
        body: "People think mathematics is rigid. I think it's the most imaginative discipline there is — you build worlds that must stay internally consistent.",
      },
      {
        title: 'Bernoulli numbers, finally',
        body: 'Worked through generating the Bernoulli numbers step by step. If a machine could follow these steps, it could compute them without me.',
      },
    ],
  },
  {
    email: 'alan@example.com',
    posts: [
      {
        title: 'Can machines think?',
        body: 'A provocative question. I propose replacing it with something testable: can a machine imitate a human well enough to fool an interrogator?',
      },
      {
        title: 'Breaking patterns',
        body: 'Most codes fall not to brilliance but to patience and structure. Find the regularity, and the rest unravels.',
      },
      {
        title: 'The halting problem keeps me up at night',
        body: 'There are questions no algorithm can answer in general. Oddly freeing to know exactly where the limits are.',
      },
    ],
  },
  {
    email: 'grace@example.com',
    posts: [
      {
        title: 'Found an actual bug',
        body: "Taped a moth into the logbook today — the first literal computer bug. The team won't let me hear the end of it.",
      },
      {
        title: 'Compilers are the future',
        body: 'Why should humans write in machine code? Let the computer translate human-readable instructions for us.',
      },
      {
        title: 'On nanoseconds',
        body: "I carry a length of wire about a foot long — that's how far light travels in a nanosecond. It makes latency tangible.",
      },
      {
        title: 'Standardize everything',
        body: 'If everyone writes their own dialect, nothing talks to anything. Standards are unglamorous and absolutely essential.',
      },
      {
        title: 'It is easier to ask forgiveness',
        body: 'Do the obviously right thing first, then explain it. Waiting for permission is how good ideas die.',
      },
    ],
  },
  {
    email: 'linus@example.com',
    posts: [
      {
        title: "Just a hobby, won't be big",
        body: "Started a little operating system project. Nothing serious — just scratching my own itch. We'll see where it goes.",
      },
      {
        title: 'Talk is cheap',
        body: 'Show me the code. A long design document impresses no one if the implementation never lands.',
      },
    ],
  },
  {
    email: 'margaret@example.com',
    posts: [
      {
        title: 'Software is engineering',
        body: 'We need to treat code with the same rigor as any other engineering discipline. Lives can depend on it.',
      },
      {
        title: 'Priority displays saved the landing',
        body: 'The system drops low-priority tasks under overload. Today that design decision mattered more than I can say.',
      },
      {
        title: 'Error handling is the feature',
        body: 'The happy path is the easy 20%. The real work is everything that can go wrong.',
      },
    ],
  },
  {
    // Intentionally has no posts — shows the "No posts yet" empty state in the UI.
    email: 'katherine@example.com',
    posts: [],
  },
];

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const postRepo = dataSource.getRepository(PostModel);

  if (reset) {
    // Delete posts before users to respect the foreign key.
    await dataSource.createQueryBuilder().delete().from(PostModel).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    console.log('--reset: cleared all existing posts and users.\n');
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let usersCreated = 0;
  let postsCreated = 0;
  let usersSkipped = 0;

  for (const seed of SEED_USERS) {
    const existing = await userRepo.findOne({ where: { email: seed.email } });
    if (existing) {
      usersSkipped++;
      console.log(`• ${seed.email} already exists — skipping`);
      continue;
    }

    const user = await userRepo.save(
      userRepo.create({ email: seed.email, password: passwordHash }),
    );
    usersCreated++;

    for (const post of seed.posts) {
      await postRepo.save(
        postRepo.create({ ...post, author: { id: user.id } }),
      );
      postsCreated++;
    }

    console.log(`✓ ${seed.email} — ${seed.posts.length} post(s)`);
  }

  console.log(
    `\nDone. Users created: ${usersCreated}, posts created: ${postsCreated}, users skipped: ${usersSkipped}.`,
  );
  console.log(`Every demo account's password is: ${DEMO_PASSWORD}`);

  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await dataSource.destroy().catch(() => undefined);
  process.exit(1);
});
