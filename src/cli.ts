#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

function generateWhereMapping() {
    // Localiser le fichier schema.prisma
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (!fs.existsSync(schemaPath)) {
        console.error('Erreur : schema.prisma introuvable à', schemaPath);
        process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Extraire les modèles
    const modelRegex = /model\s+(\w+)\s*{/g;
    const models = [];
    let match;

    while ((match = modelRegex.exec(schema)) !== null) {
        models.push(match[1]);
    }

    if (models.length === 0) {
        console.warn('Aucun modèle trouvé dans le fichier schema.prisma.');
        return;
    }

    // Générer le type mapping
    const mappingLines = models.map(
        (model) => `    ${model}: Prisma.${model}WhereInput;`
    );

    const output = `import { Prisma } from '@prisma/client';

export type ModelWhereMapping = {
${mappingLines.join('\n')}
};
`;

    // Écrire dans le fichier types.ts
    const packageDir = path.dirname(require.resolve('@slaega/db-validation/package.json'));
    const outputPath = path.join(packageDir, 'dist/types.ts');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);

    console.log('Mapping généré avec succès dans', outputPath);
}

// Lancer le script
generateWhereMapping();
