#!/usr/bin/env node
async function run() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Please specify a command: "prisma" or "typeorm".');
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case 'prisma':
      await import('./cli/prisma-type-generator').then((module) => module.default());
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
