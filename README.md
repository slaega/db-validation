Voici un modèle de **README.md** adapté à votre projet **@slaega/db-validation**, avec un exemple d'utilisation basé sur le code que vous avez fourni. Ce README explique comment utiliser le package pour valider des règles dans un service NestJS.

---

# @slaega/db-validation

**@slaega/db-validation** est un package de validation pour les services NestJS, permettant de valider les règles de base de données avec Prisma avant d'effectuer des opérations de création ou de mise à jour. Il simplifie la gestion des règles de validation telles que `exists` et `unique`, en intégrant facilement des requêtes Prisma dans le processus de validation.

---

## 🚀 Fonctionnalités

- **Validation des entrées** : Valide des règles comme l'existence d'un modèle ou l'unicité d'un champ dans la base de données avant d'effectuer des opérations.
- **Facile à utiliser** : Intégration facile avec NestJS et Prisma, grâce à un builder fluide pour la validation.
- **Extension** : Permet d'ajouter des règles personnalisées et de gérer la validation directement dans les services.

---

## 📦 Installation

### Installation depuis npm :

```bash
yarn add @slaega/db-validation
```

---

## ⚙️ Utilisation

### **1. Configuration des règles de validation**

Le package permet de définir des règles de validation à l'aide de `DbValidationBuilder`. Voici un exemple pour valider des entités avant de les créer ou les mettre à jour dans un service :

#### Exemple de `LegalRequirementValidationRules` :

```typescript
import { DbValidationBuilder } from '@slaega/db-validation';

export class PostValidationRules {
    create(
        { userId }: UserPathParam,
        data: CreatePostRequest
    ) {
        return DbValidationBuilder.new()
            .exists('UserModel', { userId })
            .unique(
                'PostModel',
                {  title: data.title },
                undefined,
                'Post already exists'
            );
    }

    update(
        { userId, postId }: PostPathParam,
        data: UpdatePostRequest
    ) {
        return DbValidationBuilder.new()
            .exists(
                'PostModel',
                { id: postId, userId },
                'Post non trouvé'
            )
            .unique(
                'PostModel',
                { title: data.title },
                { id: postId },
                'Post already exists'
            );
    }

    findOne({ userId, postId }: PostPathParam) {
        return DbValidationBuilder.new().exists(
            'PostModel',
            { id: postId, userId },
            'Post non trouvé'
        );
    }
}
```

### **2. Intégration avec un Service**

Utilisez les règles de validation dans vos services NestJS en combinant le package avec un décorateur personnalisé pour valider les entrées de manière simple.

#### Exemple de Service avec `DbValidatorService` :

```typescript
import { Injectable } from '@nestjs/common';
import { LegalRequirementRepository } from './legal-requirement.repository';
import { DbValidatorService } from '@slaega/db-validation';
import { LegalRequirementValidationRules } from './legal-requirement.validation-rules';
import { UseDbValidationSimple } from '@slaega/db-validation';

@Injectable()
export class PostService {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly dbValidatorService: DbValidatorService
    ) {}

    @UseDbValidationSimple(PostValidationRules, 'create')
    create(
        { userId }: UserPathParam,
        inputRequest: CreatePostRequest
    ) {
        return this.postRepository.create(
            PostMapper.fromCreateInput({
                ...inputRequest,
                userId,
            })
        );
    }

    @UseDbValidationSimple(PostValidationRules, 'update')
    update(
        { userId, postId }: PostPathParam,
        inputRequest: UpdatePostRequest
    ) {
        return this.postRepository.update(
            postId,
            inputRequest
        );
    }
}
```

### **3. Validation simple avec un décorateur**

Le décorateur `@UseDbValidationSimple` permet d’appliquer les règles de validation sur les méthodes du service. Vous pouvez l'utiliser pour valider automatiquement les entrées avant toute interaction avec la base de données.

---

## 🎯 Fonctionnalités de Validation

Voici les règles de validation disponibles dans le builder :

- **`.exists(modelName, where, errorMessage)`** : Vérifie si un enregistrement existe dans la base de données.
- **`.unique(modelName, where, exclude, errorMessage)`** : Vérifie l'unicité d'un champ dans la base de données.

---

## 🛠 Développement Local

Si vous souhaitez développer ou tester ce package en local :

1. **Clonez le dépôt** :
   ```bash
   git clone https://github.com/slaega/db-validation.git
   cd db-validation
   ```

2. **Installez les dépendances** :
   ```bash
   yarn install
   ```

3. **Construisez le package** :
   ```bash
   yarn build
   ```

4. **Testez dans un autre projet local** :
   Depuis un autre projet, ajoutez ce package :
   ```bash
   yarn add file:../chemin/vers/db-validation
   ```

5. **Exécutez la validation dans votre projet** :
   ```bash
   npx @slaega/db-validation
   ```

---

## 🧪 Tests

Pour exécuter les tests :
```bash
yarn test
```

Pour lancer les tests en mode veille :
```bash
yarn test:watch
```

---

## 🔧 Contribution

Les contributions sont les bienvenues ! Suivez ces étapes :

1. **Forkez le dépôt**.
2. **Créez une branche de fonctionnalité** :
   ```bash
   git checkout -b ma-nouvelle-fonctionnalité
   ```
3. **Soumettez une pull request**.

---

## 🛡️ Licence

Ce projet est sous licence **UNLICENSED**. Veuillez consulter le fichier [LICENSE](LICENSE).

---

## 📫 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le [dépôt GitHub](https://github.com/slaega/db-validation/issues).

---

## 🌟 Auteurs

Créé et maintenu par **Slaega**.

---

N'hésitez pas à me faire part de toute modification ou amélioration que vous souhaitez apporter à ce README ! 😊