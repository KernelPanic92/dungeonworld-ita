const fs = require('fs');
const path = require('path');

const githubBaseUrl =
  'https://github.com/KernelPanic92/dungeonworld-ita/raw/master';


function calculate() {
  const directoryPath = process.env.GITHUB_WORKSPACE + '/classi';
  const relative = process.env.GITHUB_WORKSPACE;

  const markdown = [];
  createMarkdown(directoryPath, relative,  markdown, 0);
  updateReadme(markdown.join('\n'));
}

function updateReadme(classList) {
  const inputFilePath = 'README.md';

  if (!fs.existsSync(inputFilePath)) {
    console.log(`File not found: ${inputFilePath}`);
    return;
  }

  const inputContent = fs.readFileSync(inputFilePath, 'utf8');
  const pattern = /<!-- START_CLASSLIST -->(.*?)<!-- END_CLASSLIST -->/s;
  const replacedContent = inputContent.replace(
    pattern,
    `<!-- START_CLASSLIST -->\n${classList}\n<!-- END_CLASSLIST -->`
  );

  fs.writeFileSync(inputFilePath, replacedContent);
  console.log(`Content between comments replaced and saved to ${inputFilePath}`);
}

function createMarkdown(currentDirectory, relative, markdown, level) {
  const fileSystemEntities = fs
    .readdirSync(currentDirectory, { withFileTypes: true })
    .filter((entity) => !entity.name.startsWith('.'))
    .sort((left, right) => left.name.localeCompare(right.name));

  const files = fileSystemEntities.reduce((acc, entity) => {
    if (entity.isFile()) {
      const name = path.basename(entity.name, path.extname(entity.name));
      const extension = path.extname(entity.name).slice(1);
      acc[name] = acc[name] ?? {};
      acc[name][extension] = path.join(currentDirectory, entity.name);
    }
    return acc;
  }, {});

  const directories = fileSystemEntities.filter((entity) => entity.isDirectory());
  const padding = ' '.repeat(level * 2);

  for (const [name, extensions] of Object.entries(files)) {
    let row = `${padding}- ${name}`;
    for (const [extension, filePath] of Object.entries(extensions)) {
      const url = encodeURI(`${githubBaseUrl}${filePath}`.replace(relative, ''));
      row += ` [[${extension}](${url})]`;
    }
    markdown.push(row);
  }

  for (const directory of directories) {
    const name = path.basename(directory.name);
    markdown.push(`${padding}- ${name}`);
    createMarkdown(path.join(currentDirectory, directory.name), relative, markdown, level + 1);
  }
}

calculate();
