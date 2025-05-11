# @slaega/db-validation

[🇫🇷 Version française](README.fr.md)

**@slaega/db-validation** is a NestJS validation library that supports multiple ORMs (Prisma, TypeORM, MicroORM, Sequelize). It allows you to declare common database validations through a unified builder and integrate them into your services via decorators with result retrieval.

---

## 🚀 Features

- **Multi-ORM Support**: Compatible with Prisma, TypeORM, MicroORM, and Sequelize
- **Unified Builder**: A single builder with ORM-specific methods
- **Smart Validations**: 
  - `exists` (404 Not Found) - Returns the entity if found
  - `ensureExists` (400 Bad Request) - Returns the entity if found
  - `unique` (409 Conflict)
  - `ensureNotExists` (400 Bad Request)
  - Count validations: `ensureCountAtLeast`, `ensureCountAtMost`, `ensureCountEquals`
- **Decorator with Results**: Retrieve validated entities directly in your methods
- **Type-safe**: Full TypeScript support for all ORMs

---

## 📦 Installation

```bash
yarn add @slaega/db-validation
# or
npm install @slaega/db-validation
```

### Required Dependencies

1. NestJS Dependencies (required in all cases)
```bash
yarn add @nestjs/common @nestjs/core reflect-metadata
```

2. ORM-specific Dependencies

#### For Prisma
```bash
yarn add @prisma/client
```

#### For TypeORM
```bash
yarn add @nestjs/typeorm typeorm
```

#### For MikroORM
```bash
yarn add @mikro-orm/core @mikro-orm/nestjs
```

#### For Sequelize
```bash
yarn add @nestjs/sequelize sequelize sequelize-typescript
```

### Module Configuration

#### With Prisma

```typescript
import { Module } from '@nestjs/common';
import { DbValidationModule } from '@slaega/db-validation';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    DbValidationModule.registerAsync({
      imports: [PrismaModule],
      useFactory: (prisma: PrismaService) => ({
        adapter: new PrismaAdapter(prisma)
      }),
      inject: [PrismaService],
    }),
  ],
})
export class AppModule {}
```

#### With TypeORM

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbValidationModule } from '@slaega/db-validation';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // your TypeORM config
    }),
    DbValidationModule.forRoot({
      useFactory: (dataSource: DataSource) => ({
        adapter: new TypeORMAdapter(dataSource)
      }),
      inject: [DataSource]
    })
  ]
})
export class AppModule {}
```

#### With MikroORM

```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DbValidationModule } from '@slaega/db-validation';
import { MikroORM } from '@mikro-orm/core';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      // your MikroORM config
    }),
    DbValidationModule.forRoot({
      useFactory: (orm: MikroORM) => ({
        adapter: new MikroOrmAdapter(orm)
      }),
      inject: [MikroORM]
    })
  ]
})
export class AppModule {}
```

#### With Sequelize

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DbValidationModule } from '@slaega/db-validation';
import { Sequelize } from 'sequelize-typescript';

@Module({
  imports: [
    SequelizeModule.forRoot({
      // your Sequelize config
    }),
    DbValidationModule.forRoot({
      useFactory: (sequelize: Sequelize) => ({
        adapter: new SequelizeAdapter(sequelize)
      }),
      inject: [Sequelize]
    })
  ]
})
export class AppModule {}
```

---

## ⚙️ Usage

### 1. Using the Builder

The builder can be used directly or in a validation class. Here's the syntax for each ORM:

#### With Prisma
```typescript
import { ValidationBuilder } from '@slaega/db-validation';

// Using model names as strings
const builder = ValidationBuilder
  .forPrisma()
  .ensureExists('User', { id: 1 })
  .unique('Post', { title: 'My title' });
```

#### With TypeORM
```typescript
import { ValidationBuilder } from '@slaega/db-validation';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

// Using Entity classes
const builder = ValidationBuilder
  .forTypeorm()
  .ensureExists(User, { id: 1 })
  .unique(Post, { title: 'My title' });
```

#### With MikroORM
```typescript
import { ValidationBuilder } from '@slaega/db-validation';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

// Using Entity classes
const builder = ValidationBuilder
  .forMikroOrm()
  .ensureExists(User, { id: 1 })
  .unique(Post, { title: 'My title' });
```

#### With Sequelize
```typescript
import { ValidationBuilder } from '@slaega/db-validation';
import { User } from './models/user.model';
import { Post } from './models/post.model';

// Using Sequelize models
const builder = ValidationBuilder
  .forSequelize()
  .ensureExists(User, { id: 1 })
  .unique(Post, { title: 'My title' });
```

### 2. Organization with Validation Classes

For better code organization and easier mapping with the `@UseDbValidation` decorator, create a validation class per service. Each class contains rules for the corresponding service methods:

```ts
import { ValidationBuilder } from '@slaega/db-validation';

// With Prisma

// post.validation-rules.ts
export class PostValidationRules {
  // Rule for PostService.create
  create(email: string, input: CreatePostDto) {
    return ValidationBuilder
      .forPrisma()
      .ensureExists('Author', { email }, {
        message: 'Author not found',
        code: 'AUTHOR_NOT_FOUND'
      })
      .ensureNotExists('Post', { title: input.title }, {
        message: 'Title already exists',
        code: 'TITLE_DUPLICATE'
      });
  }
}

// 2. Using in service with result retrieval
@Injectable()
export class PostService {
  constructor(
    private readonly repo: PostRepository,
    private readonly dbValidationService: DbValidationService, // The attribute name doesn't matter
  ) {}

  // Note: The decorator automatically detects DbValidationService in the service
  // If you extend or modify DbValidationService, you must specify the getter:
  // @UseDbValidation(PostValidationRules, 'create', (self) => self.dbValidationService)
  //
  // Otherwise, automatic detection is sufficient:

  @UseDbValidation(PostValidationRules, 'create')
  async createPost(
    email: string,
    input: CreatePostDto,
    options?: ValidationOptions
  ) {
    // Results are in validation order
    const [authorResult, _] = options?.validationResult ?? [];

    // authorResult contains the Author object directly
    const author = authorResult;

    // You can use the validated author data
    return this.repo.create({
      ...input,
      authorId: author.id,
    });
  }
}
```

The validation flow:
1. The decorator executes rules defined in `PostValidationRules.create`
2. `ensureExists` checks the author and returns its data if found
3. `ensureNotExists` verifies the title doesn't exist
4. Results are passed to the method via `options.validationResult`
5. You can use validated data (e.g., author) in your logic

### 3. Usage without Decorator

You can also use the validator directly:

```ts
const builder = new PostValidationRules().create(userId, input);
const results = await dbValidatorService.validate(builder);

// Access results
const [userResult] = results; 

console.log(userResult)
```

---

## 🧩 Validation Methods

### HTTP Code Behavior

| Validation | Condition | HTTP Code | Exception | OK Result |
|------------------|------------|-------------|---------------|------------------|
| exists           | Record found | 404 | NotFoundException | ✅ Found object |
| ensureExists     | Record found | 400 | BadRequestException | ✅ Found object |
| unique           | No duplicate | 409 | ConflictException | ✅ true |
| ensureNotExists  | No duplicate | 400 | BadRequestException | ✅ true |
| ensureCountAtLeast| Count ≥ min | 400 | BadRequestException | ✅ { count: number } |
| ensureCountAtMost| Count ≤ max | 400 | BadRequestException | ✅ { count: number } |
| ensureCountEquals| Count = val | 400 | BadRequestException | ✅ { count: number } |

### Result Examples

```ts
// For exists/ensureExists
const [userResult] = await service.validate(builder);
console.log(userResult); // { id: 1, email: 'user@example.com', ... }

// For unique/ensureNotExists
const [uniqueResult] = await service.validate(builder);
console.log(uniqueResult); // true

// For count validations
const [countResult] = await service.validate(builder);
console.log(countResult); // { count: 5 }
```

---

## 🧪 Local Testing

1. **Clone & install**  
   ```bash
   git clone https://github.com/slaega/db-validation.git
   cd db-validation
   yarn install
   ```

2. **Build**  
   ```bash
   yarn build
   ```

3. **Link in a project**  
   ```bash
   yarn link
   cd ../your-app
   yarn link @slaega/db-validation
   yarn install
   ```

4. **Tests**  
   ```bash
   yarn test
   yarn test:watch
   ```

---

## 🤝 Contributing

1. Fork the repo  
2. Create a branch (`git checkout -b feature/my-feature`)  
3. Commit your changes (`git commit -m 'Add feature'`)  
4. Push to your branch (`git push origin feature/my-feature`)  
5. Open a Pull Request

---

## 📄 License

This project is under the **MIT** license. See [LICENSE](LICENSE) for more details.

---

> Maintained by **Slaega**. Feel free to open issues on GitHub!
