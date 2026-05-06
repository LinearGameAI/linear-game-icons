import path from "path";
import chalk from "chalk";
import { consola } from "consola";
import { readdir, readJson, writeJson } from "fs-extra";
import { pathSvg, pathReact } from "./path";
import { run } from "./run";
import { execSync } from "child_process";

interface ReleaseStats {
  totalIcons: number;
  newIcons: string[];
  buildSuccess: boolean;
  newVersion: string;
  publishSuccess: boolean;
}

// 获取当前图标列表
async function getCurrentIcons(): Promise<string[]> {
  const files = await readdir(pathSvg);
  return files.filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', ''));
}

// 获取上次发布的图标列表（从缓存文件）
async function getPreviousIcons(): Promise<string[]> {
  const cachePath = path.resolve(process.cwd(), '.icon-release-cache.json');
  try {
    const cache = await readJson(cachePath);
    return cache.icons || [];
  } catch {
    return [];
  }
}

// 保存当前图标列表到缓存
async function saveIconCache(icons: string[]): Promise<void> {
  const cachePath = path.resolve(process.cwd(), '.icon-release-cache.json');
  await writeJson(cachePath, { icons, timestamp: new Date().toISOString() });
}

// 获取包版本
async function getPackageVersion(): Promise<string> {
  const pkgPath = path.join(pathReact, 'package.json');
  const pkg = await readJson(pkgPath);
  return pkg.version;
}

// 自动升级版本号（patch）
async function bumpVersion(): Promise<string> {
  const pkgPath = path.join(pathReact, 'package.json');
  const pkg = await readJson(pkgPath);
  const [major, minor, patch] = pkg.version.split('.').map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;
  pkg.version = newVersion;
  await writeJson(pkgPath, pkg, { spaces: 2 });
  return newVersion;
}

// 主流程
async function main() {
  const stats: ReleaseStats = {
    totalIcons: 0,
    newIcons: [],
    buildSuccess: false,
    newVersion: '',
    publishSuccess: false,
  };

  try {
    consola.box(chalk.cyan.bold('🚀 开始发版流程'));

    // 步骤 1: 同步 SVG 文件
    consola.start(chalk.blue('📥 步骤 1/5: 同步 SVG 图标...'));
    await run('pnpm run sync-icon', process.cwd());
    consola.success(chalk.green('✅ SVG 图标同步完成'));

    // 统计图标变化
    const currentIcons = await getCurrentIcons();
    const previousIcons = await getPreviousIcons();
    stats.totalIcons = currentIcons.length;
    stats.newIcons = currentIcons.filter(icon => !previousIcons.includes(icon));

    consola.info(chalk.gray(`   总图标数: ${stats.totalIcons}`));
    if (stats.newIcons.length > 0) {
      consola.info(chalk.gray(`   新增图标: ${stats.newIcons.length} 个`));
      stats.newIcons.slice(0, 10).forEach(icon => {
        consola.info(chalk.gray(`     - ${icon}`));
      });
      if (stats.newIcons.length > 10) {
        consola.info(chalk.gray(`     ... 还有 ${stats.newIcons.length - 10} 个`));
      }
    } else {
      consola.info(chalk.gray(`   无新增图标`));
    }

    // 步骤 2: 升级版本号
    consola.start(chalk.blue('📝 步骤 2/5: 升级版本号...'));
    stats.newVersion = await bumpVersion();
    consola.success(chalk.green(`✅ 版本号已升级至: ${stats.newVersion}`));

    // 步骤 3: 构建 React 图标库
    consola.start(chalk.blue('🔨 步骤 3/5: 构建 React 图标库...'));
    await run('pnpm run build:react', process.cwd());
    stats.buildSuccess = true;
    consola.success(chalk.green('✅ React 图标库构建完成'));

    // 步骤 4: 预览 React 图标
    consola.start(chalk.blue('👀 步骤 4/5: 启动预览服务器...'));
    consola.info(chalk.yellow('   提示: 请手动验证图标显示是否正常'));
    consola.info(chalk.yellow('   验证完成后，按 Ctrl+C 继续发布流程'));
    try {
      await run('pnpm run preview:react', process.cwd());
    } catch (error) {
      // 用户按 Ctrl+C 中断预览，继续流程
      consola.info(chalk.gray('   预览服务已停止'));
    }

    // 步骤 5: 发布图标库
    consola.start(chalk.blue('📦 步骤 5/5: 发布到 npm...'));

    // 确认发布
    consola.info(chalk.yellow(`   即将发布版本: ${stats.newVersion}`));
    consola.info(chalk.yellow(`   包名: @yoroll/react-icon`));

    // 这里可以添加确认逻辑，或者直接发布
    await run('pnpm run publish:react', process.cwd());
    stats.publishSuccess = true;
    consola.success(chalk.green('✅ 发布成功'));

    // 保存图标缓存
    await saveIconCache(currentIcons);

    // 提交 git 变更
    consola.start(chalk.blue('📝 提交 git 变更...'));
    try {
      execSync('git add .', { cwd: process.cwd() });
      execSync(`git commit -m "feat: sync icons and bump react-icon to ${stats.newVersion}"`, { cwd: process.cwd() });
      consola.success(chalk.green('✅ Git 提交完成'));
    } catch (error) {
      consola.warn(chalk.yellow('⚠️  Git 提交失败或无变更'));
    }

    // 输出总结
    printSummary(stats);

  } catch (error) {
    consola.error(chalk.red(`❌ 发版失败: ${(error as Error).message}`));
    printSummary(stats);
    process.exit(1);
  }
}

// 打印发版总结
function printSummary(stats: ReleaseStats) {
  console.log('\n');
  consola.box(
    chalk.cyan.bold('📊 发版总结\n\n') +
    chalk.white(`图标统计:\n`) +
    chalk.gray(`  • 总图标数: ${stats.totalIcons}\n`) +
    chalk.gray(`  • 新增图标: ${stats.newIcons.length} 个\n`) +
    (stats.newIcons.length > 0 ? chalk.gray(`  • 新增列表: ${stats.newIcons.slice(0, 5).join(', ')}${stats.newIcons.length > 5 ? '...' : ''}\n`) : '') +
    chalk.white(`\n构建状态: ${stats.buildSuccess ? chalk.green('✅ 成功') : chalk.red('❌ 失败')}\n`) +
    chalk.white(`新版本号: ${stats.newVersion ? chalk.green(stats.newVersion) : chalk.gray('未生成')}\n`) +
    chalk.white(`发布状态: ${stats.publishSuccess ? chalk.green('✅ 已发布') : chalk.yellow('⏸️  未发布')}`)
  );
}

main();
