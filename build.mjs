import {mkdir,cp,rm,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await rm('dist',{recursive:true,force:true});
await mkdir('dist');
for(const file of ['index.html','src','public']) await cp(file,`dist/${file}`,{recursive:true});
// Version the complete module graph together so cached metric-only modules
// cannot be combined with the imperial UI after a release.
const files=(await readdir('src')).filter(file=>/\.(js|css)$/.test(file)).sort();
const digest=createHash('sha256');
for(const file of files)digest.update(await readFile(`src/${file}`));
const version=digest.digest('hex').slice(0,12);
for(const file of files.filter(file=>file.endsWith('.js'))){
 const code=await readFile(`src/${file}`,'utf8');
 await writeFile(`dist/src/${file}`,code.replace(/((?:from\s*|import\s*)['"])(\.\/[^'"?]+\.js)(['"])/g,`$1$2?v=${version}$3`));
}
const html=await readFile('index.html','utf8');
await writeFile('dist/index.html',html.replace(/(\.\/src\/(?:app\.js|style\.css))(?:\?[^"']*)?/g,`$1?v=${version}`));
console.log('Build statico pronto in dist/');
