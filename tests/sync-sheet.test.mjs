import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

test("빈 시트를 동기화해도 화면에서 목록의 필드를 사용할 수 있다", async () => {
  const directory = await mkdtemp(join(tmpdir(), "wedding-sheet-test-"));
  try {
    // 실제 시트와 저장소의 생성 파일을 변경하지 않고 빈 응답을 재현한다.
    const mockFetch = "globalThis.fetch = async () => new Response('');";
    execFileSync(process.execPath, [
      "--import", `data:text/javascript,${encodeURIComponent(mockFetch)}`,
      fileURLToPath(new URL("../scripts/sync-sheet.mjs", import.meta.url)),
    ], { cwd: directory });
    await copyFile(
      new URL("../app/data-types.ts", import.meta.url),
      join(directory, "app/data-types.ts"),
    );

    const generatedPath = join(directory, "app/generated-data.ts");
    const generated = await readFile(generatedPath, "utf8");
    const javascript = ts.transpileModule(generated, {
      compilerOptions: { module: ts.ModuleKind.ESNext },
    }).outputText;
    const data = await import(`data:text/javascript,${encodeURIComponent(javascript)}`);
    for (const name of ["priorityTasks", "studioExtras", "studioPrep", "honeymoonBookings", "honeymoonRoute"]) {
      assert.deepEqual(data[name], [], name);
    }

    const probePath = join(directory, "app/probe.ts");
    await writeFile(probePath, `
import * as data from "./generated-data";
data.budgetCategories.map(row => row.label + row.amount + row.color);
data.priorityTasks.map(row => row.date + row.title + row.detail + row.type + row.priority);
data.vendors.map(row => row.name + row.category + row.status + row.total + row.next + row.date);
data.studioExtras.map(row => row.item + row.kind + row.price + row.status + row.note);
data.studioPrep.map(row => row.audience + row.item + row.status + row.note);
data.timeline.map(row => row.date + row.title + row.state);
data.honeymoonBookings.map(row => row.kind + row.date + row.title + row.details.map(detail => detail.label + detail.value));
data.honeymoonRoute.map(row => row.date + row.city + row.plan + row.state);
`, "utf8");
    const program = ts.createProgram([probePath], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    });
    const errors = ts.getPreEmitDiagnostics(program);
    assert.equal(errors.length, 0, ts.formatDiagnosticsWithColorAndContext(errors, {
      getCanonicalFileName: path => path,
      getCurrentDirectory: () => directory,
      getNewLine: () => "\n",
    }));
  } finally {
    assert.ok(directory.startsWith(join(tmpdir(), "wedding-sheet-test-")));
    await rm(directory, { recursive: true, force: true });
  }
});
