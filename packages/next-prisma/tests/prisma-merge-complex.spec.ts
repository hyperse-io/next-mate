import * as fs from 'node:fs';
import { promisify } from 'node:util';
import { prismaMerge } from '../src/index.js';

const readFile = promisify(fs.readFile);

describe('prisma-merge-complex', () => {
  test('merge prisma complex', async () => {
    const luciaPrismaContent = `
    model User {
      id  String  @id @default(uuid())
      name String
    }
`;

    await prismaMerge({
      luciaPrismaModel: luciaPrismaContent,
      input: ['tests/prisma/test3.prisma'],
      output: 'tests/prisma/testMerge3.prisma',
    });

    const prismaContent = await readFile('tests/prisma/testMerge3.prisma', {
      encoding: 'utf-8',
    });
    expect(prismaContent).toMatchSnapshot();
  });
});
