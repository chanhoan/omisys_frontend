#!/usr/bin/env node
/**
 * OMISYS 백엔드가 커밋한 OpenAPI 스펙을 이 저장소로 벤더링한다.
 *
 * 백엔드는 형제 디렉터리(`../omisys`)에 있고 CI 에는 없다. 사본을 커밋해 두면
 * 형제 저장소 없이도 계약 대조 테스트가 돈다.
 *
 *   node scripts/sync-openapi.mjs           # 복사
 *   node scripts/sync-openapi.mjs --check   # 복사하지 않고 최신인지만 확인
 *
 * 백엔드 DTO 를 고쳤다면 `../omisys` 에서 `python3 scripts/api/dump_openapi.py <svc>` 로
 * 스펙을 다시 뽑은 뒤 이 스크립트를 돌린다.
 */

import console from 'node:console'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_REPO = process.env.OMISYS_REPO ?? join(REPO_ROOT, '..', 'omisys')
const SOURCE_DIR = join(SOURCE_REPO, 'docs', 'api')
const TARGET_DIR = join(REPO_ROOT, 'contracts', 'openapi')
const SPEC_SUFFIX = '.json'

function readSpecNames(dir) {
  return readdirSync(dir).filter((name) => name.endsWith(SPEC_SUFFIX)).sort()
}

/** 복사는 바이트 그대로 한다. JSON.parse 왕복은 서식을 바꾼다. */
function read(path) {
  return readFileSync(path)
}

/**
 * 비교할 때만 줄바꿈을 정규화한다. Windows 체크아웃에서 git 이 LF 를 CRLF 로 바꿔 두면
 * 바이트 비교가 항상 실패하는데, 줄바꿈은 계약 차이가 될 수 없다.
 */
function normalized(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
}

function check() {
  if (!existsSync(SOURCE_DIR)) {
    console.log(`형제 저장소가 없어 건너뜁니다: ${SOURCE_DIR}`)
    console.log('벤더된 사본으로 계속 진행합니다.')
    return
  }

  const stale = []
  for (const name of readSpecNames(SOURCE_DIR)) {
    const target = join(TARGET_DIR, name)
    if (!existsSync(target) || normalized(target) !== normalized(join(SOURCE_DIR, name))) {
      stale.push(name)
    }
  }

  if (stale.length > 0) {
    console.error('벤더된 스펙이 최신이 아닙니다:')
    for (const name of stale) console.error(`  ${name}`)
    console.error('`npm run contracts:sync` 를 실행하세요.')
    process.exitCode = 1
    return
  }

  console.log(`벤더된 스펙이 최신입니다 (${readSpecNames(TARGET_DIR).length}개).`)
}

function sync() {
  if (!existsSync(SOURCE_DIR)) {
    throw new Error(
      `스펙 원본을 찾을 수 없습니다: ${SOURCE_DIR}\n` +
      'OMISYS_REPO 환경변수로 백엔드 저장소 경로를 지정하세요.',
    )
  }

  mkdirSync(TARGET_DIR, { recursive: true })
  const names = readSpecNames(SOURCE_DIR)
  for (const name of names) {
    writeFileSync(join(TARGET_DIR, name), read(join(SOURCE_DIR, name)))
  }
  console.log(`스펙 ${names.length}개를 ${TARGET_DIR} 로 복사했습니다.`)
}

if (process.argv.includes('--check')) check()
else sync()
