/** auto generated code by "yarn generate" */
export const luciaPrismaContent = `datasource db {
  provider = "sqlite"
  url      = "./prisma.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String       @id
  username    String       @unique
  email       String?      @unique
  authSession Session[]
  authorized  Authorized[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("user")
}

model Authorized {
  id             String  @id
  userId         String
  hashedPassword String?
  providerId     String?
  providerMethod String
  user           User    @relation(references: [id], fields: [userId], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("authorized")
}

model Session {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    String
  expiresAt DateTime @default(now())
  user      User     @relation(references: [id], fields: [userId], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("session")
}
`;
