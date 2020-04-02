import * as core from '@actions/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as installer from 'setup-dotnet/lib/installer.js';

// The destination path in which we create the side by side dotnet installation.
const SXS_DOTNET_PATH = path.join(process.env['HOME'] || '', 'sxs-dotnet');

async function run() {
  try {
    const dotnetVersions = getDotnetVersions();
    await installSxsDotnet(dotnetVersions);
    exportSxsDotnet();
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getDotnetVersions(): string[] {
  const input = core.getInput('dotnet-versions', {required: true});
  const versions = input
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .sort();
  if (!versions.length) {
    throw 'No dotnet-versions were specified';
  }
  console.log('Installing', versions);
  return versions;
}

async function installSxsDotnet(dotnetVersions: string[]) {
  for (const dotnetVersion of dotnetVersions) {
    const dotnetPath = await installDotnet(dotnetVersion);
    console.log('Copying %s to %s', dotnetPath, SXS_DOTNET_PATH);
    await fs.copy(dotnetPath, SXS_DOTNET_PATH);
  }
}

async function installDotnet(version: string): Promise<string> {
  console.log('Installing', version);
  const dotnetInstaller = new installer.DotnetCoreInstaller(version);
  await dotnetInstaller.installDotnet();
  return <string>process.env['DOTNET_ROOT'];
}

function exportSxsDotnet() {
  core.exportVariable('DOTNET_ROOT', SXS_DOTNET_PATH);
  core.exportVariable('DOTNET_CLI_TELEMETRY_OPTOUT', '1');
  core.exportVariable('DOTNET_SKIP_FIRST_RUN_EXPERIENCE', 'true');
  core.addPath(SXS_DOTNET_PATH);
}

run();
