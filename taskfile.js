const { resolve } = require('path')
const { execSync } = require('child_process')
const fg = require('fast-glob')

function convToUnixFormat() {
  const isWindows = /^win/.test(process.platform)
  const isMac = process.platform === 'darwin'
  if (!(isWindows || isMac)) {
    return
  }

  const cwd = process.cwd()
  const files = fg.sync('dist/**/*', { cwd })
  files.forEach(function(file) {
    if (isWindows) {
      execSync(`.\\bin\\dos2unix.exe ${file}`, { cwd })
    } else if (isMac) {
      try {
        execSync(`dos2unix -c Mac ${file}`, { cwd })
      } catch (ignore) {
        console.log('Please install dos2unix by `brew install dos2unix`')
        process.exit(1)
      }
    }
  })
}

module.exports = {
  *cleanDist(task) {
    yield task.clear('dist')
  },
  *cleanWorkspace(task) {
    yield task.clear('workspace')
  },
  *tsc(task) {
    yield task.source('src/**/*.ts').typescript().target('dist', { mode: '0755' })
  },
  *toUnixFormat(task) {
    convToUnixFormat()
  },
  *chmod755(task) {
    yield task.target('dist/cli/nextron*.js', { mode: '0755' })
  },
  *build(task) {
    yield task.serial(['cleanDist', 'cleanWorkspace', 'tsc', 'toUnixFormat', 'chmod755'])
  },
  *release(task) {
    yield task.serial(['cleanDist', 'tsc', 'toUnixFormat', 'chmod755'])
  }
}
