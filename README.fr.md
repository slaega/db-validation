# @slaega/db-validation

**@slaega/db-validation** est une bibliothèque de validation NestJS qui supporte plusieurs ORMs (Prisma, TypeORM, MicroORM, Sequelize). Elle permet de déclarer des validations de base de données courantes via un builder unifié et de les intégrer dans vos services via des décorateurs avec récupération des résultats.

---

## 🚀 Features

- **Support Multi-ORM**: Compatible avec Prisma, TypeORM, MicroORM et Sequelize
- **Builder Unifié**: Un seul builder avec méthodes spécifiques par ORM
- **Validations Intelligentes**: 
  - `exists` (404 Not Found) - Retourne l'entité si trouvée
  - `ensureExists` (400 Bad Request) - Retourne l'entité si trouvée
  - `unique` (409 Conflict)
  - `ensureNotExists` (400 Bad Request)
  - Validations de comptage : `ensureCountAtLeast`, `ensureCountAtMost`, `ensureCountEquals`
- **Décorateur avec résultats**: Récupérez les entités validées directement dans vos méthodes
- **Type-safe**: Support TypeScript complet pour tous les ORMs

---

## 📦 Installation

```bash
yarn add @slaega/db-validation
# ou
npm install @slaega/db-validation
```

### Dépendances requises

1. Dépendances NestJS (requises dans tous les cas)
```bash
yarn add @nestjs/common @nestjs/core reflect-metadata
```

2. Dépendances spécifiques à votre ORM

#### Pour Prisma
```bash
yarn add @prisma/client
```

#### Pour TypeORM
```bash
yarn add @nestjs/typeorm typeorm
```

#### Pour MikroORM
```bash
yarn add @mikro-orm/core @mikro-orm/nestjs
```

#### Pour Sequelize
```bash
yarn add @nestjs/sequelize sequelize sequelize-typescript
```

### Configuration du Module

#### Avec Prisma

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

#### Avec TypeORM

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbValidationModule } from '@slaega/db-validation';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // votre config TypeORM
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

#### Avec MikroORM

```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DbValidationModule } from '@slaega/db-validation';
import { MikroORM } from '@mikro-orm/core';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      // votre config MikroORM
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

#### Avec Sequelize

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DbValidationModule } from '@slaega/db-validation';
import { Sequelize } from 'sequelize-typescript';

@Module({
  imports: [
    SequelizeModule.forRoot({
      // votre config Sequelize
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

### 1. Utilisation du Builder

Le builder peut être utilisé directement ou dans une classe de validation. Voici la syntaxe pour chaque ORM :

#### Avec Prisma
```typescript
import { ValidationBuilder } from '@slaega/db-validation';

// Utilisation des noms de modèles en string
const builder = ValidationBuilder
  .forPrisma()
  .ensureExists('User', { id: 1 })
  .unique('Post', { title: 'Mon titre' });
```

#### Avec TypeORM
```typescript
import { ValidationBuilder } from '@slaega/db-validation';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

// Utilisation des classes Entity
const builder = ValidationBuilder
  .forTypeorm()
  .ensureExists(User, { id: 1 })
  .unique(Post, { title: 'Mon titre' });
```

#### Avec MikroORM
```typescript
import { ValidationBuilder } from '@slaega/db-validation';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';

// Utilisation des classes Entity
const builder = ValidationBuilder
  .forMikroOrm()
  .ensureExists(User, { id: 1 })
  .unique(Post, { title: 'Mon titre' });
```

#### Avec Sequelize
```typescript
import { ValidationBuilder } from '@slaega/db-validation';
import { User } from './models/user.model';
import { Post } from './models/post.model';

// Utilisation des modèles Sequelize
const builder = ValidationBuilder
  .forSequelize()
  .ensureExists(User, { id: 1 })
  .unique(Post, { title: 'Mon titre' });
```

### 2. Organisation avec les classes de validation

Pour une meilleure organisation du code et faciliter le mapping avec le décorateur `@UseDbValidation`, créez une classe de validation par service. Chaque classe contient les règles pour les méthodes du service correspondant :

```ts
import { ValidationBuilder } from '@slaega/db-validation';

// Avec Prisma

// post.validation-rules.ts
export class PostValidationRules {
  // Règle pour PostService.create
  create(authorId: number, input: CreatePostDto) {
    return ValidationBuilder
      .forPrisma()
      .ensureExists('User', { id: authorId }, {
        message: 'Author not found',
        code: 'AUTHOR_NOT_FOUND'
      })
      .unique('Post', { title: input.title }, {
        message: 'Title already in use',
        code: 'TITLE_NOT_UNIQUE'
      });
  }

  // Règle pour PostService.update
  update(postId: number, authorId: number, input: UpdatePostDto) {
    return ValidationBuilder
      .forPrisma()
      .ensureExists('Post', { id: postId, authorId }, {
        message: 'Post not found',
        code: 'POST_NOT_FOUND'
      })
      .unique('Post', 
        { title: input.title },
        { id: postId },
        { message: 'Title already in use' }
      );
  }
}

// Avec TypeORM/MicroORM/Sequelize
import { User } from './user.entity';
import { Post } from './post.entity';

// post.validation-rules.ts
export class PostValidationRules {
  // Règle pour PostService.create
  create(authorId: number, input: CreatePostDto) {
    return ValidationBuilder
      .forTypeorm() // ou .forMicroOrm(), .forSequelize()
      .ensureExists(User, { id: authorId }, {
        message: 'Author not found',
        code: 'AUTHOR_NOT_FOUND'
      })
      .unique(Post, { title: input.title }, {
        message: 'Title already in use',
        code: 'TITLE_NOT_UNIQUE'
      });
  }

  // Règle pour PostService.update
  update(postId: number, authorId: number, input: UpdatePostDto) {
    return ValidationBuilder
      .forTypeorm()
      .ensureExists(Post, { id: postId, authorId }, {
        message: 'Post not found',
        code: 'POST_NOT_FOUND'
      })
      .unique(Post, 
        { title: input.title },
        { id: postId },
        { message: 'Title already in use' }
      );
  }
}
```

### 2. Utiliser le décorateur avec récupération des résultats

Le décorateur `@UseDbValidation` permet de :
1. Mapper une classe de règles à une méthode
2. Exécuter les validations avant la méthode
3. Récupérer les résultats des validations, notamment les entités trouvées

Voici un exemple complet :

```ts
import { Injectable } from '@nestjs/common';
import { UseDbValidation, ValidationOptions } from '@slaega/db-validation';
import { PostRepository } from './post.repository';

// 1. Définition des règles
class PostValidationRules {
  create(email: number, input: CreatePostDto) {
    return ValidationBuilder
      .forPrisma()
      .ensureExists('Author', { email: email }, {
        message: 'Author not found',
        code: 'AUTHOR_NOT_FOUND'
      })
      .ensureNotExists('Post', { title: input.title }, {
        message: 'Title already exists',
        code: 'TITLE_DUPLICATE'
      });
  }
}

// 2. Utilisation dans le service avec récupération des résultats
@Injectable()
export class PostService {
  constructor(
    private readonly repo: PostRepository,
    private readonly dbValidationService: DbValidationService, // Le nom de l'attribut n'a pas d'importance
  ) {}

  // Note: Le décorateur détecte automatiquement le DbValidationService dans le service
  // Si vous étendez ou modifiez DbValidationService, vous devez spécifier le getter :
  // @UseDbValidation(PostValidationRules, 'create', (self) => self.dbValidationService)
  //
  // Sinon, la détection automatique suffit :

  @UseDbValidation(PostValidationRules, 'create')
  async createPost(
    email: number,
    input: CreatePostDto,
    options?: ValidationOptions
  ) {
    // Les résultats sont dans l'ordre des validations
    const [authorResult, _] = options?.validationResult ?? [];

    // authorResult.data contient l'Author car ensureExists retourne l'entité
    const author = authorResult;

    // Vous pouvez utiliser les données de l'auteur validé
    return this.repo.create({
      ...input,
      authorId:author.Id,
    });
  }
}
```

Le flux de validation :
1. Le décorateur exécute les règles définies dans `PostValidationRules.create`
2. `ensureExists` vérifie l'auteur et retourne ses données si trouvé
3. `ensureNotExists` vérifie que le titre n'existe pas
4. Les résultats sont passés à la méthode via `options.validationResult`
5. Vous pouvez utiliser les données validées (ex: author) dans votre logique


### 3. Utilisation sans décorateur

Vous pouvez aussi utiliser le validateur directement :

```ts

const builder = new PostValidationRules().create(userId, input);
const results = await dbValidatorService.validate(builder);

// Accès aux résultats
const [userResult] = results; 

console.log(userResult)
```

---

## 🧩 Méthodes de Validation

### Comportement des codes HTTP

| Validation | Condition | HTTP Code | Exception | Résultat OK |
|------------------|------------|-------------|---------------|------------------|
| exists           | Record trouvé | 404 | NotFoundException | ✅ L'objet trouvé |
| ensureExists     | Record trouvé | 400 | BadRequestException | ✅ L'objet trouvé |
| unique           | Pas de doublon | 409 | ConflictException | ✅ true |
| ensureNotExists  | Pas de doublon | 400 | BadRequestException | ✅ true |
| ensureCountAtLeast| Count ≥ min | 400 | BadRequestException | ✅ { count: number } |
| ensureCountAtMost| Count ≤ max | 400 | BadRequestException | ✅ { count: number } |
| ensureCountEquals| Count = val | 400 | BadRequestException | ✅ { count: number } |

### Exemple de résultats

```ts
// Pour exists/ensureExists
const [userResult] = await service.validate(builder);
console.log(userResult); // { id: 1, email: 'user@example.com', ... }

// Pour unique/ensureNotExists
const [uniqueResult] = await service.validate(builder);
console.log(uniqueResult); // true

// Pour les validations de count
const [countResult] = await service.validate(builder);
console.log(countResult); // { count: 5 }
```

---

## 🧪 Tests en local

1. **Clone & installation**  
   ```bash
   git clone https://github.com/slaega/db-validation.git
   cd db-validation
   yarn install
   ```

2. **Build**  
   ```bash
   yarn build
   ```

3. **Link dans un projet**  
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

## 🤝 Contribution

1. Fork le repo  
2. Créez une branche (`git checkout -b feature/ma-feature`)  
3. Committez vos changements (`git commit -m 'Ajout feature'`)  
4. Push vers votre branche (`git push origin feature/ma-feature`)  
5. Ouvrez une Pull Request

---

## 📄 License

Ce projet est sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

---

> Maintenu par **Slaega**. N'hésitez pas à ouvrir des issues sur GitHub !
