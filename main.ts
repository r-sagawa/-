import { parseArgs } from '@std/cli/parse-args'

function testArgs() {
  // Deno.args: 実行時に渡された引数を配列で取得する
  // ex) deno run main.ts --name=foo -a 20 hoge fuga
  console.log(Deno.args);

  // parseArgs(): 引数をパースしてオブジェクトに変換する
  // - もしくは -- で始まる引数をキーとし、その次の引数を値としてオブジェクトに格納する
  console.log(parseArgs(Deno.args));

}

function parseArguments(args: string[]) {
  const booleanArgs = [
    "list",
    "help",
  ];

  const stringArgs = [
    "msg",
  ];

  const alias = {
    "msg": "m",
    "list": "l",
    "help": "h",
  };

  return parseArgs(args, {
    alias,
    boolean: booleanArgs,
    string: stringArgs,
    stopEarly: false,
    "--": true,
  });
}

function printHelp() {
  console.log(`Usage: honk [OPTIONS...]`);
  console.log("\nOptional flags:");
  console.log("  -h, --help                Display this help and exit");
  console.log("  -l, --list                Msg list");
}

async function main(inputArgs: string[]) {
  const args = parseArguments(inputArgs);

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  // 対象ファイルが無ければ作成、あれば開く
  // `:memory:`を指定すると、インメモリでデータが管理される
  const kv = await Deno.openKv("./db/tmp.db");

  const msg = args._.join();
  if (msg) {
    await kv.set(["msg", msg], msg);
  }

  if (args.list) {
    const lists = kv.list({ prefix: ["msg"] });
    for await (const entry of lists) {
      console.log(`('-' ) < ${entry.value})`);
    }
  }
}

//testArgs()

// 実行には --unstable-kv --allow-read --allow-write オプションが必要
// deno run --unstable-kv --allow-read --allow-write main.ts "Hello, World!"
main(Deno.args)

// バイナリにコンパイルする場合
// deno compile --allow-read --allow-write --unstable-kv main.ts --output honk
// …だけど、 --output オプションが効かない…なぜ…