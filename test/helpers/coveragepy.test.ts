import path from 'path'
import childProcess from 'child_process'
import td from 'testdouble'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/constants'
import { generateCoveragePyFile } from '../../src/helpers/coveragepy'
import * as fileHelpers from '../../src/helpers/files'

describe('generateCoveragePyFile()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should run when coveragepy is asked for', async () => {
        const fixturesCoveragePyDir = path.join(
            fileHelpers.fetchGitRoot(false),
            'test/fixtures/coveragepy',
        )

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({
            stdout: Buffer.from('coverage installed'),
            error: undefined
        })
        td.when(spawnSync('coverage', td.matchers.contains('xml'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: Buffer.from('xml'),
            error: undefined
        })

        expect(await generateCoveragePyFile(fixturesCoveragePyDir, [])).toBe('xml')
    })

    it('should return if a file is provided', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({
            stdout: Buffer.from('coverage installed'),
            error: undefined
        })

        const projectRoot = process.cwd()
        expect(await generateCoveragePyFile(projectRoot, ['fakefile'])).toBe('Skipping coveragepy, files already specified')
    })

    it('should return a log when coveragepy is not installed', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({ error: new Error("command not found: coverage") })

        const projectRoot = process.cwd()
        expect(await generateCoveragePyFile(projectRoot, [])).toBe('coveragepy is not installed')
    })

    it('should return a log when there are no dotcoverage files', async () => {
        const fixturesYamlDir = path.join(
            fileHelpers.fetchGitRoot(false),
            'test/fixtures/yaml',
        )

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({
            stdout: Buffer.from('coverage installed'),
            error: undefined
        })

        expect(await generateCoveragePyFile(fixturesYamlDir, [])).toBe('Skipping coveragepy, no .coverage file found.')
    })
})
