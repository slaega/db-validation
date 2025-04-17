# @slaega/db-validation

**@slaega/db-validation** is a NestJS‑compatible validation library for Prisma‑backed services. It lets you declare common database checks—like “exists” or “unique”—via a fluent builder, and integrates them into your service or controller via decorators.

---

## 🚀 Features

- **Existence check**: Verify that a record exists before proceeding.  
- **Uniqueness check**: Ensure a field is unique (optionally excluding the current record).  
- **Custom rules**: Extend with your own validation logic.  
- **Decorator integration**: Hook validations into your service methods with a single decorator.

---

## 📦 Installation

```bash
yarn add @slaega/db-validation
# or
npm install @slaega/db-validation
```

Since this package declares NestJS and Prisma as **peerDependencies**, make sure your app has them installed too:

```bash
yarn add @nestjs/common @nestjs/core @prisma/client reflect-metadata
```

---

## ⚙️ Usage

### 1. Define validation rules

Create a class that returns a `DbValidationBuilder` instance for each method you want to guard:

```ts
import { DbValidationBuilder } from '@slaega/db-validation';

export class PostValidationRules {
  create(userId: number, data: { title: string }) {
    return DbValidationBuilder.new()
      .exists('User', { id: userId }, 'User not found')
      .unique('Post', { title: data.title }, undefined, 'Post title already in use');
  }

  update(userId: number, postId: number, data: { title: string }) {
    return DbValidationBuilder.new()
      .exists('Post', { id: postId, authorId: userId }, 'Post not found')
      .unique('Post', { title: data.title }, { id: postId }, 'Title conflict');
  }

  findOne(userId: number, postId: number) {
    return DbValidationBuilder.new()
      .exists('Post', { id: postId, authorId: userId }, 'Post not found');
  }
}
```

### 2. Apply via decorator # UseDbValidationSimple

Use the built‑in decorator to run your rules automatically before the decorated method:

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

### 2. Apply via decorator # UseDbValidation

Use the built‑in decorator to run your rules automatically before the decorated method:

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

## 🛠 API

#### `DbValidationBuilder`

| Method                                            | Description                                                                                              |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `.exists(modelName, where, errorMessage?)`        | Throws `NotFoundException` if no record matches `where`.                                                 |
| `.unique(modelName, where, exclude?, errorMessage?)` | Throws `ConflictException` if a record matching `where` exists and doesn’t match `exclude`.            |
| `.dependent(modelName, where, dependentField, expectedValue, errorMessage?)` | Throws `BadRequestException` if record’s `dependentField` ≠ `expectedValue`. |
| `.equals(value, expected, errorMessage?)`         | Throws `BadRequestException` if `value !== expected`.                                                    |
| `.inList(value, list, errorMessage?)`             | Throws `BadRequestException` if `value` not in `list`.                                                    |
| `.notInList(value, list, errorMessage?)`          | Throws `BadRequestException` if `value` is in `list`.                                                    |
| `.custom(validateFn, errorType?, errorMessage?)`  | Runs arbitrary async `validateFn`; throws exception based on `errorType` (`not_found`, `conflict`, or `bad_request`). |

---

## 🔄 Regenerating Mappings

Whenever you update your Prisma schema, regenerate the client and then re-run the CLI to rebuild your TypeScript mapping:

```bash
# Direct commands:
npx prisma generate && npx db-validation

# Or via package.json scripts:
# package.json
"scripts": {
  "prisma:generate": "prisma generate",
  "generate:types": "npm run prisma:generate && npm run generate",
  "generate": "db-validation"
}

# Then:
npm run generate:types
# or
yarn generate:types
```

This will produce a `dist/types.ts` file containing:

```ts
import { Prisma } from '@prisma/client';

export type ModelWhereMapping = {
  User: Prisma.UserWhereInput;
  Post: Prisma.PostWhereInput;
  // …and so on for each model
};
```

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

This project is **UNLICENSED**—please see [LICENSE](LICENSE) for details.

---

> Maintained by **Slaega**. Feel free to open issues on GitHub!

