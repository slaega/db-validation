# @slaega/db-validation

**@slaega/db-validation** is a NestJS‑compatible validation library that supports both Prisma and TypeORM. It lets you declare common database checks—like "exists" or "unique"—via a fluent builder, and integrates them into your service or controller via decorators.

---

## 🚀 Features

- **Multi-ORM Support**: Works with both Prisma and TypeORM out of the box
- **Existence check**: Verify that a record exists before proceeding
- **Uniqueness check**: Ensure a field is unique (optionally excluding the current record)
- **Dependent check**: Validate field dependencies and relationships
- **Decorator integration**: Hook validations into your service methods with a single decorator
- **Type-safe**: Full TypeScript support for both Prisma and TypeORM entities

---

## 📦 Installation

```bash
yarn add @slaega/db-validation
# or
npm install @slaega/db-validation
```

Install the required peer dependencies based on your ORM:

### For Prisma
```bash
yarn add @nestjs/common @nestjs/core @prisma/client reflect-metadata
```

### For TypeORM
```bash
yarn add @nestjs/common @nestjs/core @nestjs/typeorm typeorm reflect-metadata
```

---

## ⚙️ Usage

### 1. Define validation rules

Create a class that returns a validation builder instance for each method you want to guard. You can use either PrismaValidationBuilder or TypeORMValidationBuilder:

#### Using Prisma
```ts
import { PrismaValidationBuilder } from '@slaega/db-validation';

export class PostValidationRules {
  create(userId: number, data: { title: string }) {
    return PrismaValidationBuilder.create()
      .exist('User', { id: userId }, 'User not found')
      .unique('Post', { title: data.title }, 'Post title already in use');
  }

  update(userId: number, postId: number, data: { title: string }) {
    return PrismaValidationBuilder.create()
      .exist('Post', { id: postId, authorId: userId }, 'Post not found')
      .unique('Post', { title: data.title }, 'Title conflict')
      .dependent('Post', { id: postId }, 'status', 'DRAFT', 'Cannot edit published posts');
  }
}
```

#### Using TypeORM
```ts
import { TypeORMValidationBuilder } from '@slaega/db-validation';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

export class PostValidationRules {
  create(userId: number, data: { title: string }) {
    return TypeORMValidationBuilder.create()
      .exists(User, { id: userId }, 'User not found')
      .unique(Post, { title: data.title }, undefined, 'Post title already in use');
  }

  update(userId: number, postId: number, data: { title: string }) {
    return TypeORMValidationBuilder.create()
      .exists(Post, { id: postId, authorId: userId }, 'Post not found')
      .unique(Post, { title: data.title }, { id: postId }, 'Title conflict')
      .dependent(Post, { id: postId }, 'status', 'DRAFT', 'Cannot edit published posts');
  }
}
```

### 2. Option A: Simple Decorator Usage (Recommended)

Use the built‑in decorator to run your validation rules automatically. Works the same way for both Prisma and TypeORM:

```ts
import { Injectable } from '@nestjs/common';
import { UseDbValidationSimple } from '@slaega/db-validation';
import { PostRepository } from './post.repository';
import { PostValidationRules } from './post.validation-rules';

@Injectable()
export class PostService {
  constructor(
    private readonly repo: PostRepository,
    public readonly dbValidatorService: DbValidationService, // this name must match the decorator
  ) {}

  @UseDbValidationSimple(PostValidationRules, 'create')
  async createPost(userId: number, input: { title: string }) {
    return this.repo.create({ ...input, authorId: userId });
  }

  @UseDbValidationSimple(PostValidationRules, 'update')
  async updatePost(userId: number, postId: number, input: { title: string }) {
    return this.repo.update(postId, input);
  }
}
```

### 2. Option B: Advanced Decorator Usage

Alternatively, you can use the lower-level decorator for more control over validation:

```ts
import { Injectable } from '@nestjs/common';
import { UseDbValidation } from '@slaega/db-validation';
import { PostRepository } from './post.repository';
import { PostValidationRules } from './post.validation-rules';

@Injectable()
export class PostService {
  constructor(
    private readonly repo: PostRepository,
    public readonly dbValidatorService: DbValidationService, // this name must match the decorator
  ) {}

  @UseDbValidation(PostValidationRules, 'create', (self) => self.dbValidatorService)
  async createPost(userId: number, input: { title: string }) {
    return this.repo.create({ ...input, authorId: userId });
  }

  @UseDbValidation(PostValidationRules, 'update', (self) => self.dbValidatorService)
  async updatePost(userId: number, postId: number, input: { title: string }) {
    return this.repo.update(postId, input);
  }
}
```

> 💡 The property name `dbValidatorService` must match the default expected by the decorator (`UseDbValidationSimple`). If you'd prefer a custom name, use `UseDbValidationFrom()` instead and provide the key.

---

### 3. Without decorators (manual usage)

If you don’t want to use decorators, you can call the validator directly:

```ts
const builder = new PostValidationRules().create(userId, input);
await dbValidatorService.validate(builder);
```

---

## 🧩 Decorators API

### `@UseDbValidation`
Low-level decorator. Lets you control how the validator service is retrieved from `this`.

```ts
@UseDbValidation(RulesClass, 'methodName', (self) => self.myCustomValidator)
```

### `@UseDbValidationFrom`
Mid-level decorator. Lets you specify the property name of the validator service on the class (defaults to `validationService`).

```ts
@UseDbValidationFrom(RulesClass, 'methodName', 'dbValidatorService')
```

### `@UseDbValidationSimple`
High-level, opinionated decorator. Looks for a property named `dbValidatorService` in your class.

```ts
@UseDbValidationSimple(RulesClass, 'methodName')
```

---

## 🔧 Module Configuration

Import and configure the module based on your ORM:

### Using Prisma

```ts
import { Module } from '@nestjs/common';
import { DbValidationModule } from '@slaega/db-validation';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    DbValidationModule.forRoot({
      useFactory: (prisma: PrismaService) => ({
        adapter: 'prisma',
        client: prisma
      }),
      inject: [PrismaService]
    })
  ],
  providers: [PrismaService]
})
export class AppModule {}
```

### Using TypeORM

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbValidationModule } from '@slaega/db-validation';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // your TypeORM config
    }),
    DbValidationModule.forRoot({
      useFactory: (dataSource: DataSource) => ({
        adapter: 'typeorm',
        client: dataSource
      }),
      inject: [DataSource]
    })
  ]
})
export class AppModule {}
```

---

## 🧱 API

### Validation Builders

#### `PrismaValidationBuilder`

| Method                                            | Description                                                                                              |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `.exist(modelName, where, errorMessage?)`         | Throws `NotFoundException` if no record matches `where`.                                                 |
| `.unique(modelName, where, errorMessage?)`        | Throws `ConflictException` if a record matching `where` exists.                                        |
| `.dependent(modelName, where, dependentField, expectedValue, errorMessage?)` | Throws `BadRequestException` if record's `dependentField` ≠ `expectedValue`. |

#### `TypeORMValidationBuilder`

| Method                                            | Description                                                                                              |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `.exists(entity, where, errorMessage?)`           | Throws `NotFoundException` if no record matches `where`.                                                 |
| `.unique(entity, where, exclude?, errorMessage?)`  | Throws `ConflictException` if a record matching `where` exists and doesn't match `exclude`.            |
| `.dependent(entity, where, dependentField, expectedValue, errorMessage?)` | Throws `BadRequestException` if record's `dependentField` ≠ `expectedValue`. |

---



## 🧪 Testing locally

To develop and test your package in isolation:

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

3. **Link into a consuming project**  
   ```bash
   yarn link
   cd ../your-app
   yarn link @slaega/db-validation
   yarn install
   ```

4. **Run tests**  
   ```bash
   yarn test
   yarn test:watch
   ```

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/my-change`)  
3. Commit your changes (`git commit -m 'Add feature'`)  
4. Push to your branch (`git push origin feature/my-change`)  
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT** License. See [LICENSE](LICENSE) for details.

---

> Maintained by **Slaega**. Feel free to open issues on GitHub!

