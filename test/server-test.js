import { join } from 'path';
import { readFileSync } from 'fs';
import glob from 'glob';
import server from '../src/server';
import expect from 'expect';

function assert(actualDir, _expect) {
  const expectDir = join(__dirname, 'expect', _expect);
  const actualFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });

  actualFiles.forEach(file => {
    const actualFile = readFileSync(join(actualDir, file), 'utf-8');
    const expectFile = readFileSync(join(expectDir, file), 'utf-8');
    expect(actualFile).toEqual(expectFile);
  });
}

function testServer(args, fixture) {
  return new Promise(resolve => {
    const cwd = join(__dirname, 'fixtures', fixture);
    const outputPath = join(cwd, 'dist');
    process.chdir(cwd);

    const defaultConfig = {
      cwd
    };

    server({...defaultConfig, ...args}, err => {
      if (err) throw new Error(err);
      assert(outputPath, fixture);
      resolve();
    });
});
}

describe('lib/server', function () {
  this.timeout(50000);
  /*it('should build normally', () => {
    return testServer({ hash: true }, 'build-server-normal');
  });
  it('should support port', () => {
    return testServer({ prot: 1234 }, 'build-server-port');
  });
  it('should support entry', () => {
    return testServer({ entry: 'index' }, 'build-server-entry');
  });
  it('should support proxy', () => {
    return testServer({ entry: 'index' }, 'build-server-proxy');
  });*/

  it('should support template', () => {
    return testServer({ entry: 'index' }, 'build-server-template');
  });

});
