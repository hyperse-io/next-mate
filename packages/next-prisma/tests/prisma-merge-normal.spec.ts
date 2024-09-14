import * as fs from 'node:fs';
import { promisify } from 'node:util';
import { prismaMerge } from '../src/index.js';

const readFile = promisify(fs.readFile);

describe('prisma-merge-normal', () => {
  it('merge prisma test 1', async () => {
    const luciaPrismaContent = `
    model User {
      id String @unique
      name String
    }
`;

    await prismaMerge({
      luciaPrismaModel: luciaPrismaContent,
      input: ['tests/prisma/test1.prisma'],
      output: 'tests/prisma/testMerge1.prisma',
    });

    const prismaContent = await readFile('tests/prisma/testMerge1.prisma', {
      encoding: 'utf-8',
    });
    expect(prismaContent).toMatchSnapshot();
  });

  it('merge prisma test 2', async () => {
    const luciaPrismaContent = `
    model User {
      id String @unique
      name String
    }
`;

    await prismaMerge({
      luciaPrismaModel: luciaPrismaContent,
      input: ['tests/prisma/test2.prisma'],
      output: 'tests/prisma/testMerge2.prisma',
    });

    const prismaContent = await readFile('tests/prisma/testMerge2.prisma', {
      encoding: 'utf-8',
    });
    expect(prismaContent).toMatchSnapshot();
  });

  it('merge prisma all', async () => {
    const luciaPrismaContent = `
      model User {
        id String @unique
        name String
      }
  `;

    await prismaMerge({
      luciaPrismaModel: luciaPrismaContent,
      input: ['tests/prisma/test1.prisma', 'tests/prisma/test2.prisma'],
      output: 'tests/prisma/testMerge1-2.prisma',
    });

    const prismaContent = await readFile('tests/prisma/testMerge1-2.prisma', {
      encoding: 'utf-8',
    });
    expect(prismaContent).toMatchSnapshot();
  });
});
