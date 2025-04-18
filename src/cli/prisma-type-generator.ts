import * as fs from 'fs';
import * as path from 'path';

export default function generatePrismaTypes() {
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (!fs.existsSync(schemaPath)) {
        console.error('Error: schema.prisma not found at', schemaPath);
        process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const modelRegex = /model\s+(\w+)\s*{/g;
    const models = [];
    let match;

    while ((match = modelRegex.exec(schema)) !== null) {
        models.push(match[1]);
    }

    if (models.length === 0) {
        console.warn('No models found in schema.prisma.');
        return;
    }

    const mappingLines = models.map(
        (model) => `    ${model}: Prisma.${model}WhereInput;`
    );

    const output = `import { Prisma } from '@prisma/client';

export type ModelWhereMapping = {
${mappingLines.join('\n')}
};
`;

    const outputPath = path.join(__dirname, '../types', 'prisma-type.ts');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);

    console.log('Prisma type mappings generated at', outputPath);
}