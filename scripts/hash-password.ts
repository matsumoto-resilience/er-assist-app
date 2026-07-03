// アクセスパスワードのPBKDF2ハッシュを生成するCLIツール。
// 使い方: npm run hash-password -- "設定したいパスワード"
// 出力された文字列を .env.local の APP_ACCESS_PASSWORD_HASH に設定する。
import { hashPassword } from "../lib/password-hash";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('使い方: npm run hash-password -- "設定したいパスワード"');
    process.exit(1);
  }

  const hash = await hashPassword(password);
  console.log(hash);
}

main();
